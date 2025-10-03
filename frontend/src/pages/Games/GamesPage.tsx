import { useEffect, useState } from 'react'
import { Button, Card, Empty, Flex, Skeleton, Space, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import ModalCreateGame from './ModalGame/ModalCreateGame'
import ModalEditGame from './ModalGame/ModalEditGame'
import { supabase } from '@supabaseDir/supabaseClient'
import { GameType } from '@typesDir/gameTypes'
import { ActionButton, GameCardExtra, GameDetails } from './components'

import s from './GamesPage.module.scss'

type Props = {
   isArchive?: boolean
}

const GamesPage = ({ isArchive = false }: Props) => {
   const [isModalCreateOpen, setIsModalCreateOpen] = useState(false)
   const [modalEdit, setModalEdit] = useState({ open: false, id: 0 })

   const [refetch, setRefetch] = useState(false)
   const [loading, setLoading] = useState(true) // общая загрузка при первом входе
   const [games, setGames] = useState<GameType[]>([])
   const [userId, setUserId] = useState<number | null>(null)
   const [isManager, setIsManager] = useState(false)

   const [messageApi, contextHolder] = message.useMessage()

   // Получение пользователя и его прав
   useEffect(() => {
      const loadUser = async () => {
         setLoading(true)
         try {
            const {
               data: { session },
               error: authError,
            } = await supabase.auth.getSession()
            if (authError) throw authError
            if (!session) throw new Error('Пользователь не авторизован')

            const { data: userData, error: userError } = await supabase
               .from('users')
               .select('id, is_manager')
               .eq('uuid', session.user.id)
               .single()

            if (userError) throw userError
            setUserId(userData.id)
            setIsManager(!!userData.is_manager)
         } catch (error: any) {
            messageApi.error('Ошибка авторизации: ' + error.message)
         } finally {
            setLoading(false)
         }
      }

      loadUser()
   }, [])

   // Загрузка голосов и игр только после получения userId
   useEffect(() => {
      if (!userId) return

      const fetchAllData = async () => {
         setLoading(true)
         try {
            const { data: gamesData, error: gamesError } = await supabase
               .from('view_games')
               .select('*')
               .eq('is_active', !isArchive)
               .order('game_date', { ascending: true })
               .order('game_time', { ascending: true })

            if (gamesError) throw gamesError

            setGames(gamesData || [])
         } catch (error: any) {
            messageApi.error('Ошибка загрузки данных: ' + error.message)
         } finally {
            setLoading(false)
         }
      }

      fetchAllData()
   }, [userId, isArchive, refetch])

   const refresh = () => setRefetch((prev) => !prev)

   const openCreateModal = () => setIsModalCreateOpen(true)
   const closeCreateModal = () => setIsModalCreateOpen(false)

   const openEditModal = (id: number) => setModalEdit({ open: true, id })
   const closeEditModal = () => setModalEdit({ open: false, id: 0 })

   return (
      <div className={s.wrapReserved}>
         {contextHolder}
         {!isArchive ? (
            <Space size="large" style={{ marginBottom: 16 }} align="center">
               <h3 style={{ margin: '0 0 16px 0' }}>Ближайшие игры</h3>
               {isManager && (
                  <Button icon={<PlusOutlined />} onClick={openCreateModal} style={{ margin: '0 0 16px 0' }}>
                     Создать игру
                  </Button>
               )}
            </Space>
         ) : (
            <h3 style={{ margin: '0 0 16px 0' }}>Архив игр</h3>
         )}

         {loading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
         ) : games.length === 0 ? (
            <Empty description={isArchive ? 'Нет архивных игр' : 'Нет предстоящих игр'} style={{ padding: '48px 0' }} />
         ) : (
            <Flex gap={16} wrap className={s.cardWrap}>
               {games.map((game) => (
                  <Card
                     key={game.id}
                     title={game.place_name}
                     extra={
                        <GameCardExtra
                           isArchive={isArchive}
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
                     <ActionButton
                        game={game}
                        // userVoteIds={userVoteIds}
                        // setUserVoteIds={setUserVoteIds}
                        isArchive={isArchive}
                        setLoading={setLoading}
                        userId={userId}
                        refresh={refresh}
                     />
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
