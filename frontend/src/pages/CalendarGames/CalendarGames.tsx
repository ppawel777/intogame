/* eslint-disable max-len */
import { useEffect, useState } from 'react'
import { Button, Flex, Select, Skeleton, Space, message } from 'antd'
import type { Dayjs } from 'dayjs'

import { GameType } from '@typesDir/gameTypes'
import { supabase } from '@supabaseDir/supabaseClient'
import ModalCreateGame from '@pages/Games/ModalGame/ModalCreateGame'

import s from './CalendarGames.module.scss'
import { GamesModal } from './components'
import { useIsMobile } from '@utils/hooks/useIsMobile'
import { useUserId } from '@utils/hooks/useUserId'
import { GameStatusFilter } from '@components/GameStatusFilter'
import { GameCalendar } from '@components/GameCalendar'
import { PlusOutlined } from '@ant-design/icons'

const CalendarGames = () => {
   const [loading, setLoading] = useState(false)
   const [games, setGames] = useState<GameType[]>([])
   const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
   const [isModalOpen, setIsModalOpen] = useState(false)
   const [selectedGames, setSelectedGames] = useState<GameType[]>([])
   const [statusFilter, setStatusFilter] = useState<string>('Активна')
   const [placeFilter, setPlaceFilter] = useState<number | null>(null)
   const [placeList, setPlaceList] = useState<any[]>([])
   const [isModalCreateOpen, setIsModalCreateOpen] = useState(false)

   const isMobile = useIsMobile()
   const { userId, isManager } = useUserId()

   useEffect(() => {
      const fetchAllData = async () => {
         setLoading(true)
         try {
            const { data: gamesData, error: gamesError } = await supabase.from('view_games').select('*')
            if (gamesError) throw gamesError
            setGames(gamesData || [])
         } catch (error: any) {
            message.error('Ошибка загрузки данных: ' + error.message)
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
               { value: 'all', label: 'Все площадки' },
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

   const handleDateSelect = (date: Dayjs, gamesForDate: GameType[]) => {
      setSelectedDate(date)
      setSelectedGames(gamesForDate)
      setIsModalOpen(true)
   }

   const refresh = () => {
      const fetchAllData = async () => {
         setLoading(true)
         try {
            const { data: gamesData, error: gamesError } = await supabase.from('view_games').select('*')
            if (gamesError) throw gamesError
            setGames(gamesData || [])
         } catch (error: any) {
            message.error('Ошибка загрузки данных: ' + error.message)
         } finally {
            setLoading(false)
         }
      }
      fetchAllData()
   }

   const openCreateModal = () => setIsModalCreateOpen(true)
   const closeCreateModal = () => setIsModalCreateOpen(false)

   return (
      <div className={s.calendarWrap}>
         <Flex
            vertical={isMobile}
            justify="space-between"
            align={isMobile ? 'stretch' : 'center'}
            gap={isMobile ? 'small' : 'middle'}
            style={{ marginTop: '-12px', marginBottom: '12px' }}
         >
            {/* <h3>Календарь игр</h3> */}
            <Space size="large" align="center" style={{ marginTop: '12px' }}>
               <h3 style={{ margin: '0 0 16px 0' }}>Календарь игр</h3>
               {isManager && (
                  <Button icon={<PlusOutlined />} onClick={openCreateModal} style={{ margin: '0 0 16px 0' }}>
                     Создать игру
                  </Button>
               )}
            </Space>
            <Space size="middle" direction={isMobile ? 'vertical' : 'horizontal'}>
               <Select
                  placeholder="Выберите площадку"
                  options={placeList}
                  loading={loading}
                  value={placeFilter}
                  onChange={setPlaceFilter}
                  style={{ width: isMobile ? '100%' : '330px' }}
               />
               <GameStatusFilter value={statusFilter} onChange={setStatusFilter} size={isMobile ? 'small' : 'middle'} />
            </Space>
         </Flex>
         <div>
            {loading ? (
               <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
               <GameCalendar
                  games={games}
                  statusFilter={statusFilter}
                  placeFilter={placeFilter}
                  onDateSelect={handleDateSelect}
                  fullscreen={!isMobile}
               />
            )}
         </div>
         <GamesModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            games={selectedGames}
            date={selectedDate}
            userId={userId}
         />
         {isModalCreateOpen && <ModalCreateGame onClose={closeCreateModal} onSuccess={refresh} />}
      </div>
   )
}

export default CalendarGames
