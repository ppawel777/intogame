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
   const [loading, setLoading] = useState(true)
   const [games, setGames] = useState<GameType[]>([])
   const [userId, setUserId] = useState<number | null>(null)
   const [userVoteIds, setUserVoteIds] = useState<number[]>([])
   const [isManager, setIsManager] = useState(false)

   // Получение пользователя
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
            setIsManager(!!userData.is_manager) // устанавливаем флаг
         } catch (error: any) {
            message.error('Ошибка авторизации: ' + error.message)
         } finally {
            setLoading(false)
         }
      }

      loadUser()
   }, [])

   // Загрузка голоса пользователя
   useEffect(() => {
      if (!userId) return

      const loadVote = async () => {
         try {
            const { data, error } = await supabase.from('votes').select('*').eq('user_id', userId)

            if (error) throw error

            const voteIds = data.map((item) => item.game_id)
            setUserVoteIds(voteIds)
         } catch (error: any) {
            message.error('Ошибка загрузки голосов: ' + error.message)
         }
      }

      loadVote()
   }, [userId])

   // Загрузка игр
   useEffect(() => {
      const fetchGames = async () => {
         setLoading(true)
         try {
            const { data, error } = await supabase
               .from('view_games')
               .select('*')
               .eq('is_active', !isArchive)
               .order('game_date', { ascending: true })
               .order('game_time', { ascending: true })

            if (error) throw error
            setGames(data || [])
         } catch (error: any) {
            message.error('Ошибка загрузки игр: ' + error.message)
         } finally {
            setLoading(false)
         }
      }

      fetchGames()
   }, [isArchive, refetch])

   // Универсальный рефетч
   const refresh = () => setRefetch((prev) => !prev)

   // Обработчики модалок
   const openCreateModal = () => setIsModalCreateOpen(true)
   const closeCreateModal = () => setIsModalCreateOpen(false)

   const openEditModal = (id: number) => setModalEdit({ open: true, id })
   const closeEditModal = () => setModalEdit({ open: false, id: 0 })

   return (
      <div className={s.wrapReserved}>
         {!isArchive && (
            <Space size="large" style={{ marginBottom: 16 }}>
               <h3>Ближайшие игры</h3>
               {isManager && (
                  <Button icon={<PlusOutlined />} onClick={openCreateModal}>
                     Создать игру
                  </Button>
               )}
            </Space>
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
                           playerTotal={game.players_total}
                           playerLimit={game.players_limit}
                        />
                     }
                     className={s.gameCard}
                  >
                     <GameDetails game={game} />
                     <ActionButton
                        game={game}
                        userVoteIds={userVoteIds}
                        setUserVoteIds={setUserVoteIds}
                        isArchive={isArchive}
                        setLoading={setLoading}
                        userId={userId}
                        refresh={refresh}
                     />
                  </Card>
               ))}
            </Flex>
         )}

         {/* Модалки */}
         {isModalCreateOpen && <ModalCreateGame onClose={closeCreateModal} onSuccess={refresh} />}
         {modalEdit.open && <ModalEditGame id={modalEdit.id} onClose={closeEditModal} onSuccess={refresh} />}
      </div>
   )
}

export default GamesPage
