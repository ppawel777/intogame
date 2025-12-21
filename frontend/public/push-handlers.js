/**
 * Обработчики push-уведомлений для Service Worker
 * Подключается через importScripts в конфигурации VitePWA
 */

// Обработка push-уведомлений
self.addEventListener('push', (event) => {
   let notificationData = {
      title: 'В игру',
      body: 'У вас новое уведомление',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data: {},
      url: '/',
   }

   if (event.data) {
      try {
         const data = event.data.json()
         notificationData = {
            title: data.title || notificationData.title,
            body: data.body || notificationData.body,
            icon: data.icon || notificationData.icon,
            badge: data.badge || notificationData.badge,
            data: data.data || {},
            url: data.url || notificationData.url,
         }
      } catch (error) {
         console.error('Ошибка парсинга данных push-уведомления:', error)
         // Если не удалось распарсить JSON, пробуем text()
         if (event.data.text) {
            try {
               const text = event.data.text()
               const parsed = JSON.parse(text)
               notificationData = {
                  title: parsed.title || notificationData.title,
                  body: parsed.body || notificationData.body,
                  icon: parsed.icon || notificationData.icon,
                  badge: parsed.badge || notificationData.badge,
                  data: parsed.data || {},
                  url: parsed.url || notificationData.url,
               }
            } catch (e) {
               console.error('Ошибка парсинга текста:', e)
            }
         }
      }
   }

   // Проверяем разрешения на уведомления
   if (self.registration.permission === 'denied') {
      return
   }

   const notificationOptions = {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: {
         ...notificationData.data,
         url: notificationData.url,
      },
      tag: 'intogame-notification',
      requireInteraction: false,
      vibrate: [200, 100, 200],
      silent: false,
      renotify: true,
   }

   const promiseChain = self.registration
      .showNotification(notificationData.title, notificationOptions)
      .catch((error) => {
         console.error('Ошибка показа уведомления:', error)
      })

   event.waitUntil(promiseChain)
})

// Обработка клика по уведомлению
self.addEventListener('notificationclick', (event) => {
   event.notification.close()

   const urlToOpen = event.notification.data?.url || event.notification.data?.data?.url || '/'

   event.waitUntil(
      self.clients
         .matchAll({
            type: 'window',
            includeUncontrolled: true,
         })
         .then((clientList) => {
            // Если окно уже открыто, фокусируемся на нём
            for (let i = 0; i < clientList.length; i++) {
               const client = clientList[i]
               const clientUrl = new URL(client.url)
               const targetUrl = new URL(urlToOpen, self.location.origin)
               if (clientUrl.pathname === targetUrl.pathname && 'focus' in client) {
                  return client.focus()
               }
            }
            // Иначе открываем новое окно
            if (self.clients.openWindow) {
               return self.clients.openWindow(urlToOpen)
            }
         })
   )
})

// Обработка закрытия уведомления
self.addEventListener('notificationclose', (event) => {
   // Уведомление закрыто пользователем
})

