/**
 * Утилиты для работы с push-уведомлениями
 */

// В dev режиме используем относительный путь через proxy, в production - полный URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export interface PushSubscription {
   endpoint: string
   keys: {
      p256dh: string
      auth: string
   }
}

/**
 * Получение публичного VAPID ключа с сервера
 */
export const getVapidPublicKey = async (): Promise<string> => {
   try {
      // Используем относительный путь через proxy, если API_BASE_URL не задан
      const url = API_BASE_URL ? `${API_BASE_URL}/api/push/vapid-public-key` : '/api/push/vapid-public-key'
      const response = await fetch(url)
      if (!response.ok) {
         throw new Error('Не удалось получить VAPID ключ')
      }
      const data = await response.json()
      return data.publicKey
   } catch (error) {
      console.error('Ошибка получения VAPID ключа:', error)
      throw error
   }
}

/**
 * Конвертация base64 в Uint8Array для Web Push API
 */
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
   const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
   const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

   const rawData = window.atob(base64)
   const outputArray = new Uint8Array(rawData.length)

   for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
   }
   return outputArray
}

/**
 * Запрос разрешения на уведомления и регистрация push-подписки
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
   if (!('Notification' in window)) {
      throw new Error('Браузер не поддерживает уведомления')
   }

   if (Notification.permission === 'granted') {
      return 'granted'
   }

   if (Notification.permission === 'denied') {
      throw new Error('Разрешение на уведомления отклонено')
   }

   const permission = await Notification.requestPermission()
   return permission
}

/**
 * Регистрация Service Worker
 * Vite PWA plugin автоматически генерирует Service Worker
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
   if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker не поддерживается')
      return null
   }

   try {
      // Vite PWA plugin регистрирует SW автоматически, но мы можем получить регистрацию
      const registration = await navigator.serviceWorker.ready

      console.log('Service Worker готов:', registration)
      return registration
   } catch (error) {
      console.error('Ошибка получения Service Worker:', error)
      // Пытаемся зарегистрировать вручную, если нужно
      try {
         const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
         })
         return registration
      } catch (regError) {
         console.error('Ошибка регистрации Service Worker:', regError)
         return null
      }
   }
}

/**
 * Создание push-подписки
 */
export const subscribeToPush = async (registration: ServiceWorkerRegistration): Promise<PushSubscription | null> => {
   try {
      // Получаем VAPID ключ с сервера
      const vapidPublicKey = await getVapidPublicKey()

      // Создаём подписку
      const subscription = await registration.pushManager.subscribe({
         userVisibleOnly: true,
         applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      })

      return {
         endpoint: subscription.endpoint,
         keys: {
            p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
            auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
         },
      }
   } catch (error) {
      console.error('Ошибка создания push-подписки:', error)
      return null
   }
}

/**
 * Отправка подписки на сервер
 */
export const sendSubscriptionToServer = async (userId: number, subscription: PushSubscription): Promise<boolean> => {
   try {
      const url = API_BASE_URL ? `${API_BASE_URL}/api/push/subscribe` : '/api/push/subscribe'
      const response = await fetch(url, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({
            userId,
            subscription,
         }),
      })

      if (!response.ok) {
         const error = await response.json()
         throw new Error(error.error || 'Не удалось сохранить подписку')
      }

      return true
   } catch (error) {
      console.error('Ошибка отправки подписки на сервер:', error)
      return false
   }
}

/**
 * Удаление подписки
 */
export const unsubscribeFromPush = async (userId: number, endpoint: string): Promise<boolean> => {
   try {
      const url = API_BASE_URL ? `${API_BASE_URL}/api/push/unsubscribe` : '/api/push/unsubscribe'
      const response = await fetch(url, {
         method: 'DELETE',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({
            userId,
            endpoint,
         }),
      })

      if (!response.ok) {
         throw new Error('Не удалось удалить подписку')
      }

      // Отписываемся от push-менеджера
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
         await subscription.unsubscribe()
      }

      return true
   } catch (error) {
      console.error('Ошибка удаления подписки:', error)
      return false
   }
}

/**
 * Полная регистрация push-уведомлений
 */
export const registerPushNotifications = async (userId: number): Promise<boolean> => {
   try {
      // 1. Запрашиваем разрешение
      const permission = await requestNotificationPermission()
      if (permission !== 'granted') {
         console.warn('Разрешение на уведомления не получено')
         return false
      }

      // 2. Регистрируем Service Worker
      const registration = await registerServiceWorker()
      if (!registration) {
         return false
      }

      // 3. Создаём подписку
      const subscription = await subscribeToPush(registration)
      if (!subscription) {
         return false
      }

      // 4. Отправляем на сервер
      const success = await sendSubscriptionToServer(userId, subscription)
      return success
   } catch (error) {
      console.error('Ошибка регистрации push-уведомлений:', error)
      return false
   }
}
