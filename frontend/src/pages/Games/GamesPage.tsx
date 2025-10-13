import { useEffect, useState } from 'react'
import { Empty, Skeleton, message } from 'antd'
import ModalEditGame from './ModalGame/ModalEditGame'
import { supabase } from '@supabaseDir/supabaseClient'
import { GameType } from '@typesDir/gameTypes'
import { GameCard } from '@components/GameCard'
import { useUserId } from '@utils/hooks/useUserId'

import s from './GamesPage.module.scss'

const GamesPage = () => {
   const [modalEdit, setModalEdit] = useState({ open: false, id: 0 })

   const [refetch, setRefetch] = useState(false)
   const [loading, setLoading] = useState(true) // общая загрузка при первом входе
   const [games, setGames] = useState<GameType[]>([])

   const { userId, isManager, loading: userLoading } = useUserId()

   const navigateState = { state: { from: { pathname: '/games/reserved', title: 'Запись в игру' } } }

   // Загрузка голосов и игр только после получения userId
   useEffect(() => {
      if (!userId) return

      const fetchAllData = async () => {
         setLoading(true)
         try {
            const { data: gamesData, error: gamesError } = await supabase
               .from('view_games')
               .select('*')
               .eq('is_active', true)
               .order('game_date', { ascending: true })
               .order('game_time', { ascending: true })

            if (gamesError) throw gamesError

            const sortedGames = (gamesData || []).sort((a, b) => {
               const dateA = new Date(a.game_date).getTime()
               const dateB = new Date(b.game_date).getTime()
               return dateA - dateB
            })
            setGames(sortedGames)
         } catch (error: any) {
            message.error('Ошибка загрузки данных: ' + error.message)
         } finally {
            setLoading(false)
         }
      }

      fetchAllData()
   }, [userId, refetch])

   const refresh = () => setRefetch((prev) => !prev)

   const openEditModal = (e: React.MouseEvent, id: number) => {
      e.stopPropagation()
      setModalEdit({ open: true, id })
   }
   const closeEditModal = () => setModalEdit({ open: false, id: 0 })

   return (
      <div className={s.wrapReserved}>
         <h3 style={{ margin: '0 0 16px 0' }}>Ближайшие игры</h3>

         {loading || userLoading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
         ) : games.length === 0 ? (
            <Empty description={'Нет предстоящих игр'} style={{ padding: '48px 0' }} />
         ) : (
            <div className={s.gamesList}>
               {games.map((game) => (
                  <GameCard
                     key={game.id}
                     game={game}
                     isManager={isManager}
                     userId={userId}
                     onEdit={openEditModal}
                     setLoading={setLoading}
                     refresh={refresh}
                     navigateState={navigateState}
                  />
               ))}
            </div>
         )}

         {modalEdit.open && <ModalEditGame id={modalEdit.id} onClose={closeEditModal} onSuccess={refresh} />}
      </div>
   )
}

export default GamesPage
