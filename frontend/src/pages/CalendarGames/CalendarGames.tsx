/* eslint-disable max-len */
import { useEffect, useState } from 'react'
import { Badge, Calendar, Flex, Radio, Select, Skeleton, Space } from 'antd'
import type { CalendarProps } from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

import { GameType } from '@typesDir/gameTypes'
import { message } from 'antd'
import { supabase } from '@supabaseDir/supabaseClient'

import s from './CalendarGames.module.scss'
import { statusToBadgeType } from './utils/helpers'
import { GamesModal } from './components'
import { useIsMobile } from '@utils/hooks/useIsMobile'
import { formatDate } from '@pages/Games/components/gameComponentHelpers'

const CalendarGames = () => {
   const [loading, setLoading] = useState(false)
   const [games, setGames] = useState<GameType[]>([])
   const [messageApi, contextHolder] = message.useMessage()
   const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
   const [isModalOpen, setIsModalOpen] = useState(false)
   const [selectedGames, setSelectedGames] = useState<GameType[]>([])
   const [statusFilter, setStatusFilter] = useState<string>('Активна')
   const [placeFilter, setPlaceFilter] = useState<number | null>(null)
   const [placeList, setPlaceList] = useState<any[]>([])

   const isMobile = useIsMobile()

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

   useEffect(() => {
      const getPlaces = async () => {
         setLoading(true)
         try {
            const { data, error } = await supabase.from('places').select('*').eq('is_active', true)
            if (error) throw error
            const result = [
               { value: null, label: 'Все площадки' },
               ...data.map((item) => ({ value: item.id, label: item.name })),
            ]
            setPlaceList(result)
         } catch (error: any) {
            message.error(error.message)
         } finally {
            setLoading(false)
         }
      }

      getPlaces()
   }, [])

   const getListData = (value: Dayjs) => {
      // Фильтруем игры для текущей даты и по статусу
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
         const dateMatch = date.format(formatDate) === gameDate.format(formatDate)
         const statusMatch = statusFilter === 'Все' || game.game_status === statusFilter
         const placeMatch = placeFilter === null || game.place_id === placeFilter
         return dateMatch && statusMatch && placeMatch
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
         <Flex
            vertical={isMobile}
            justify="space-between"
            align={isMobile ? 'stretch' : 'center'}
            gap={isMobile ? 'small' : 'middle'}
            style={{ marginBottom: '10px' }}
         >
            <h3 style={{ margin: '0 0 16px 0' }}>Календарь игр</h3>
            <Space size="middle" direction={isMobile ? 'vertical' : 'horizontal'}>
               <Select
                  placeholder="Выберите площадку"
                  options={placeList}
                  loading={loading}
                  value={placeFilter}
                  onChange={setPlaceFilter}
                  style={{ width: isMobile ? '100%' : '330px' }}
               />
               <Radio.Group
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  size={isMobile ? 'small' : 'middle'}
               >
                  <Radio.Button value="Все">Все</Radio.Button>
                  <Radio.Button value="Активна">
                     <Badge status="success" text="Активна" />
                  </Radio.Button>
                  <Radio.Button value="Завершена">
                     <Badge status="default" text="Завершена" />
                  </Radio.Button>
                  <Radio.Button value="Отменена">
                     <Badge status="error" text="Отменена" />
                  </Radio.Button>
               </Radio.Group>
            </Space>
         </Flex>
         <div>
            {loading ? (
               <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
               <Calendar cellRender={cellRender} onSelect={handleDateSelect} />
            )}
         </div>
         {contextHolder}
         <GamesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} games={selectedGames} date={selectedDate} />
      </div>
   )
}

export default CalendarGames
