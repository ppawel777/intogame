import dayjs from 'dayjs'
import 'dayjs/locale/ru'

export const calculateDuration = (start: string, end: string): number => {
   if (!start || !end) return 0
   return dayjs(end).diff(dayjs(start), 'minute')
}

export const formatGameDate = (date: string | null): string => {
   if (!date) return ''

   const dayjsDate = dayjs(date).locale('ru')
   const day = dayjsDate.format('D MMMM')
   const weekday = dayjsDate.format('dd')
   const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1)

   return `${day}, ${capitalizedWeekday}`
}
