// Вспомогательная функция для парсинга ошибки
export const extractErrorMessage = (data: any): string => {
   if (data && typeof data === 'object') {
      const details = data.details
      if (details && typeof details === 'object') {
         return details.description || details.message || details.error || ''
      } else if (typeof details === 'string') {
         return details
      }
      if (typeof data.error === 'string') {
         return data.error
      }
   }
   return ''
}
