import { useEffect, useState } from 'react'
import { Button, Card, Empty, Flex, Skeleton, Space, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import ModalCreateGame from './ModalGame/ModalCreateGame'
import ModalEditGame from './ModalGame/ModalEditGame'
import { supabase } from '@supabaseDir/supabaseClient'
import { GameType } from '@typesDir/gameTypes'
import { ActionButton, GameCardExtra, GameDetails } from './components'
import { useUserId } from '@utils/hooks/useUserId'

import s from './GamesPage.module.scss'

const GamesPage = () => {
   const [isModalCreateOpen, setIsModalCreateOpen] = useState(false)
   const [modalEdit, setModalEdit] = useState({ open: false, id: 0 })

   const [refetch, setRefetch] = useState(false)
   const [loading, setLoading] = useState(true) // общая загрузка при первом входе
   const [games, setGames] = useState<GameType[]>([])

   const { userId, isManager, loading: userLoading } = useUserId()

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

   const openCreateModal = () => setIsModalCreateOpen(true)
   const closeCreateModal = () => setIsModalCreateOpen(false)

   const openEditModal = (id: number) => setModalEdit({ open: true, id })
   const closeEditModal = () => setModalEdit({ open: false, id: 0 })

   return (
      <div className={s.wrapReserved}>
         <Space size="large" style={{ marginBottom: 16 }} align="center">
            <h3 style={{ margin: '0 0 16px 0' }}>Ближайшие игры</h3>
            {isManager && (
               <Button icon={<PlusOutlined />} onClick={openCreateModal} style={{ margin: '0 0 16px 0' }}>
                  Создать игру
               </Button>
            )}
         </Space>

         {loading || userLoading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
         ) : games.length === 0 ? (
            <Empty description={'Нет предстоящих игр'} style={{ padding: '48px 0' }} />
         ) : (
            <Flex gap={16} wrap className={s.cardWrap}>
               {games.map((game) => (
                  <Card
                     key={game.id}
                     title={game.place_name}
                     extra={
                        <GameCardExtra
                           isManager={isManager}
                           gameId={game.id}
                           onEdit={openEditModal}
                           playerTotal={game.confirmed_players_count}
                           playerLimit={game.players_limit}
                        />
                     }
                     className={s.gameCard}
                  >
                     <GameDetails game={game} />
                     <ActionButton game={game} setLoading={setLoading} userId={userId} refresh={refresh} />
                  </Card>
               ))}
            </Flex>
         )}

         {isModalCreateOpen && <ModalCreateGame onClose={closeCreateModal} onSuccess={refresh} />}
         {modalEdit.open && <ModalEditGame id={modalEdit.id} onClose={closeEditModal} onSuccess={refresh} />}
      </div>
   )
}

export default GamesPage
