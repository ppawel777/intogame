/* eslint-disable max-len */
import { useEffect, useState } from 'react'
import { Badge, Calendar, Col, Skeleton } from 'antd'
import type { CalendarProps } from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

import { GameType } from '@typesDir/gameTypes'
import { message } from 'antd'
import { supabase } from '@supabaseDir/supabaseClient'

import s from './CalendarGames.module.scss'
import { statusToBadgeType } from './utils/helpers'
import { GamesModal } from './components'

const CalendarGames = () => {
   const [loading, setLoading] = useState(false)
   const [games, setGames] = useState<GameType[]>([])
   const [messageApi, contextHolder] = message.useMessage()
   const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
   const [isModalOpen, setIsModalOpen] = useState(false)
   const [selectedGames, setSelectedGames] = useState<GameType[]>([])

   useEffect(() => {
      const fetchAllData = async () => {
         setLoading(true)
         try {
            const { data: gamesData, error: gamesError } = await supabase.from('view_games').select('*')
            if (gamesError) throw gamesError
            setGames(gamesData || [])
         } catch (error: any) {
            messageApi.error('Ошибка загрузки данных: ' + error.message)
         } finally {
            setLoading(false)
         }
      }

      fetchAllData()
   }, [])

   const getListData = (value: Dayjs) => {
      // Фильтруем игры для текущей даты
      return games
         .filter((game) => {
            if (!game.game_date) return false
            const gameDate = dayjs(game.game_date)
            return value.format('YYYY-MM-DD') === gameDate.format('YYYY-MM-DD')
         })
         .map((game) => ({
            id: game.id,
            type: statusToBadgeType[game.game_status ?? ''],
            content: game.game_time
               ? `${dayjs(game.game_time[0]).format('HH:mm')} - ${dayjs(game.game_time[1]).format('HH:mm')} | ${game.place_name}`
               : '',
         }))
   }

   const dateCellRender = (value: Dayjs) => {
      const listData = getListData(value)
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
         return date.format('YYYY-MM-DD') === gameDate.format('YYYY-MM-DD')
      })

      if (gamesForDate.length > 0) {
         // Сортируем игры: Активные в начале
         const sortedGames = [...gamesForDate].sort((a, b) => {
            if (a.game_status === 'Активна' && b.game_status !== 'Активна') return -1
            if (a.game_status !== 'Активна' && b.game_status === 'Активна') return 1
            return 0
         })

         setSelectedDate(date)
         setSelectedGames(sortedGames)
         setIsModalOpen(true)
      }
   }

   return (
      <div className={s.calendarWrap}>
         <h3 style={{ margin: '0 0 16px 0' }}>Календарь игр</h3>
         <Col span={24}>
            {contextHolder}
            {loading ? (
               <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
               <Calendar cellRender={cellRender} onSelect={handleDateSelect} />
            )}
            <GamesModal
               isOpen={isModalOpen}
               onClose={() => setIsModalOpen(false)}
               games={selectedGames}
               date={selectedDate}
            />
         </Col>
      </div>
   )
}

export default CalendarGames
