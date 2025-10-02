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

export const formatQtyText = (n: number): string => {
   if (n === 1) return ''
   const last = n % 10
   const lastTwo = n % 100
   if (last === 1 && lastTwo !== 11) return `${n} место`
   if ([2, 3, 4].includes(last) && ![12, 13, 14].includes(lastTwo)) return `${n} места`
   return `${n} мест`
}
