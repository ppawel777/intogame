/**
 * Регистрация Service Worker при загрузке приложения
 */

/**
 * Регистрация Service Worker при загрузке приложения
 * Vite PWA plugin автоматически регистрирует SW, но мы можем добавить дополнительную логику
 */
export const registerServiceWorkerOnLoad = () => {
   if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
         try {
            // Ждём готовности Service Worker (Vite PWA plugin регистрирует его автоматически)
            const registration = await navigator.serviceWorker.ready
            console.log('Service Worker готов:', registration.scope)

            // Проверка обновлений каждые 60 секунд
            setInterval(() => {
               registration.update()
            }, 60000)

            // Обработка обновления Service Worker
            registration.addEventListener('updatefound', () => {
               const newWorker = registration.installing
               if (newWorker) {
                  newWorker.addEventListener('statechange', () => {
                     if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // Новый Service Worker установлен, можно показать уведомление
                        console.log('Доступна новая версия приложения')
                        // Можно показать уведомление пользователю
                     }
                  })
               }
            })
         } catch (error) {
            console.error('Ошибка инициализации Service Worker:', error)
         }
      })

      // Обработка сообщений от Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
         console.log('Сообщение от Service Worker:', event.data)
      })
   }
}
