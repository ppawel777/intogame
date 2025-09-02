/* eslint-disable max-len */
import { Badge, Button, Card, Descriptions, Empty, Flex, Popconfirm, Skeleton, Space, Tooltip, message } from 'antd'
import { FormOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import ModalCreateGame from './ModalGame/ModalCreateGame'
import ModalEditGame from './ModalGame/ModalEditGame'
import { supabase } from '@supabaseDir/supabaseClient'
import dayjs from 'dayjs'
import { formatDate, formatTime } from './GamesHelper'
import DrawerUsersInfo from './ModalGame/DrawerUsersInfo'
import { GameType, GameVotesType } from '@typesDir/gameTypes'

import s from './index.module.scss'

type Props = {
   isArchive?: boolean
}

const Games = ({ isArchive = false }: Props) => {
   const [isModalCreateOpen, setIsModalCreateOpen] = useState(false)
   const [modalEdit, setModalEdit] = useState({ open: false, id: 0 })
   const [drawerUsers, setDrawerUsers] = useState({ open: false, id: 0 })
   const [refetch, setRefetch] = useState(false)
   const [loading, setLoading] = useState(true)
   const [games, setGames] = useState<GameType[]>([])
   const [userId, setUserId] = useState<number | null>(null)
   const [userVotes, setUserVotes] = useState<GameVotesType[]>([])
   const [confirmOpen, setConfirmOpen] = useState(false)
   const [confirmTarget, setConfirmTarget] = useState<number | null>(null)
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

            setUserVotes(data)
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

   // Голосование
   const voteGame = async (gameId: number) => {
      if (!userId) return
      setLoading(true)
      try {
         const { error } = await supabase.from('votes').insert({ user_id: userId, game_id: gameId })
         if (error) throw error
         message.success('Вы записаны на игру')
         setUserVotes((prev) => [...prev, { id: Date.now(), user_id: userId, game_id: gameId }])
         refresh()
      } catch (error: any) {
         message.error(error.message)
      } finally {
         setLoading(false)
         setConfirmOpen(false)
      }
   }

   // Отмена голоса
   const unvoteGame = async (gameId: number) => {
      if (!userId) return
      setLoading(true)
      try {
         const { error } = await supabase.from('votes').delete().eq('user_id', userId).eq('game_id', gameId)

         if (error) throw error
         message.success('Запись отменена')
         setUserVotes((prev) => prev.filter((vote) => vote.game_id !== gameId))
         refresh()
      } catch (error: any) {
         message.error(error.message)
      } finally {
         setLoading(false)
         setConfirmOpen(false)
      }
   }

   // Обработчики модалок
   const openCreateModal = () => setIsModalCreateOpen(true)
   const closeCreateModal = () => setIsModalCreateOpen(false)

   const openEditModal = (id: number) => setModalEdit({ open: true, id })
   const closeEditModal = () => setModalEdit({ open: false, id: 0 })

   const openUsersDrawer = (id: number) => setDrawerUsers({ open: true, id })
   const closeUsersDrawer = () => setDrawerUsers({ open: false, id: 0 })

   const GameStatus = ({ total, limit }: { total: number; limit: number }) => (
      <Badge
         status={total >= limit ? 'error' : 'success'}
         text={
            <span className={total >= limit ? s.extraFull : s.extraSuccess}>
               {total >= limit ? 'Нет мест' : 'Есть места'}
            </span>
         }
      />
   )

   const ExtraActions = ({ id }: { id: number }) => (
      <>
         {!isArchive && <FormOutlined className={s.editGameBtn} onClick={() => openEditModal(id)} />}
         {isArchive && <Badge status="default" text={<span className={s.extraClose}>Игра закрыта</span>} />}
      </>
   )

   const GameDetails = ({ game }: { game: GameType }) => {
      const [start, end] = game.game_time
      return (
         <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Дата игры">{dayjs(game.game_date).format(formatDate)}</Descriptions.Item>
            <Descriptions.Item label="Время игры">
               {dayjs(start).format(formatTime)} – {dayjs(end).format(formatTime)}
            </Descriptions.Item>
            <Descriptions.Item label="Адрес">{game.place_address}</Descriptions.Item>
            <Descriptions.Item label="Лимит игроков">{game.players_limit}</Descriptions.Item>
            <Descriptions.Item label="Участников">
               <Flex justify="space-between" align="center">
                  <strong>{game.votes_count}</strong>
                  {game.votes_count > 0 && (
                     <Button size="small" onClick={() => openUsersDrawer(game.id)}>
                        Список
                     </Button>
                  )}
               </Flex>
            </Descriptions.Item>
            <Descriptions.Item label="Цена">{game.game_price} ₽</Descriptions.Item>
            <Descriptions.Item label="Условия">
               <Flex justify="space-between" align="center">
                  <span>Оплата сразу</span>
                  <Tooltip title="После резервирования места, необходимо оплатить игру в течении 10 мин., иначе бронь будет автоматически снята">
                     <QuestionCircleOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                  </Tooltip>
               </Flex>
            </Descriptions.Item>
         </Descriptions>
      )
   }

   const ActionButton = ({ game }: { game: GameType }) => {
      if (isArchive) return null

      const isFull = game.players_total >= game.players_limit
      const hasVoted = userVotes.some((vote) => vote.game_id === game.id)

      return hasVoted ? (
         <Popconfirm
            title="Отменить запись?"
            description="Вы уверены, что хотите отменить запись на эту игру?"
            open={confirmOpen && confirmTarget === game.id}
            onConfirm={() => unvoteGame(game.id)}
            okText="Да, отменить"
            cancelText="Нет"
            onCancel={() => {
               setConfirmOpen(false)
               setConfirmTarget(null)
            }}
         >
            <Button
               danger
               block
               style={{ marginTop: 16 }}
               onClick={() => {
                  setConfirmTarget(game.id)
                  setConfirmOpen(true)
               }}
            >
               Отменить запись
            </Button>
         </Popconfirm>
      ) : (
         <Popconfirm
            title="Записаться на игру?"
            description="Подтвердите запись. Место будет зарезервировано."
            open={confirmOpen && confirmTarget === game.id}
            onConfirm={() => voteGame(game.id)}
            okText="Да, записаться"
            cancelText="Нет"
            onCancel={() => {
               setConfirmOpen(false)
               setConfirmTarget(null)
            }}
         >
            <Button
               type="primary"
               block
               style={{ marginTop: 16 }}
               disabled={isFull}
               onClick={() => {
                  setConfirmTarget(game.id)
                  setConfirmOpen(true)
               }}
            >
               {isFull ? 'Мест нет' : 'Записаться'}
            </Button>
         </Popconfirm>
      )
   }

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
                        <Space>
                           <GameStatus total={game.players_total} limit={game.players_limit} />
                           {isManager && <ExtraActions id={game.id} />}
                        </Space>
                     }
                     className={s.gameCard}
                  >
                     <GameDetails game={game} />
                     <ActionButton game={game} />
                  </Card>
               ))}
            </Flex>
         )}

         {/* Модалки */}
         {isModalCreateOpen && <ModalCreateGame onClose={closeCreateModal} onSuccess={refresh} />}
         {modalEdit.open && <ModalEditGame id={modalEdit.id} onClose={closeEditModal} onSuccess={refresh} />}
         {drawerUsers.open && <DrawerUsersInfo id={drawerUsers.id} onClose={closeUsersDrawer} />}
      </div>
   )
}

export default Games
