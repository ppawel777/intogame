/* eslint-disable max-len */
import { Calendar } from 'antd'
import type { CalendarProps } from 'antd'
import type { Dayjs } from 'dayjs'
import { Badge } from 'antd'

import { GameType } from '@typesDir/gameTypes'
import { statusToBadgeType } from '@pages/CalendarGames/utils/helpers'
// import { formatDate } from '@pages/Games/components/gameComponentHelpers'
import { useIsMobile } from '@utils/hooks/useIsMobile'
import dayjs from 'dayjs'

import s from './GameCalendar.module.scss'
import { formatDate, formatTime } from '@utils/formatDatetime'

type GameCalendarProps = {
   games: GameType[]
   statusFilter: string
   placeFilter: number | null
   onDateSelect: (date: Dayjs, gamesForDate: GameType[]) => void
   fullscreen?: boolean
}

export const GameCalendar = ({ games, statusFilter, placeFilter, onDateSelect, fullscreen = true }: GameCalendarProps) => {
   const isMobile = useIsMobile()

   const getListData = (value: Dayjs) => {
      return games
         .filter((game) => {
            if (!game.game_date) return false
            const gameDate = dayjs(game.game_date)
            const dateMatch = value.format(formatDate) === gameDate.format(formatDate)
            const statusMatch = statusFilter === 'Все' || game.game_status === statusFilter
            const placeMatch = placeFilter === null || game.place_id === placeFilter
            return dateMatch && statusMatch && placeMatch
         })
         .map((game) => ({
            id: game.id,
            type: statusToBadgeType[game.game_status ?? ''],
            content: game.game_time
               ? `${dayjs(game.game_time[0]).format(formatTime)} - ${dayjs(game.game_time[1]).format(formatTime)} | ${game.place_name}`
               : '',
         }))
   }

   const dateCellRender = (value: Dayjs) => {
      const listData = getListData(value)

      if (isMobile) {
         if (listData.length === 0) return null

         const getBadgeColor = () => {
            const statuses = listData.map((item) => item.type)
            if (statuses.includes('success')) return 'success'
            if (statuses.includes('error')) return 'error'
            return 'default'
         }

         return (
            <div className={s.mobileBadge}>
               <Badge
                  count={listData.length}
                  color={getBadgeColor() === 'success' ? '#52c41a' : getBadgeColor() === 'error' ? '#ff4d4f' : '#d9d9d9'}
               />
            </div>
         )
      }

      return (
         <ul className={s.events}>
            {listData.map((item) => (
               <li key={item.id}>
                  <Badge status={item.type} text={item.content} />
               </li>
            ))}
         </ul>
      )
   }

   const cellRender: CalendarProps<Dayjs>['cellRender'] = (current, info) => {
      if (info.type === 'date') return dateCellRender(current)
      return info.originNode
   }

   const handleDateSelect = (date: Dayjs) => {
      const gamesForDate = games.filter((game) => {
         const gameDate = dayjs(game.game_date)
         const dateMatch = date.format(formatDate) === gameDate.format(formatDate)
         const statusMatch = statusFilter === 'Все' || game.game_status === statusFilter
         const placeMatch = placeFilter === null || game.place_id === placeFilter
         return dateMatch && statusMatch && placeMatch
      })

      if (gamesForDate.length > 0) {
         const sortedGames = [...gamesForDate].sort((a, b) => {
            if (a.game_status === 'Активна' && b.game_status !== 'Активна') return -1
            if (a.game_status !== 'Активна' && b.game_status === 'Активна') return 1
            return 0
         })
         onDateSelect(date, sortedGames)
      }
   }

   return <Calendar cellRender={cellRender} onSelect={handleDateSelect} fullscreen={fullscreen} />
}
