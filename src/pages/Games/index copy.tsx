import { Badge, Button, Card, Descriptions, Empty, Flex, Popconfirm, Skeleton, Space, message } from 'antd'
import { FormOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import ModalCreateGame from './ModalGame/ModalCreateGame'
import ModalEditGame from './ModalGame/ModalEditGame'
import { supabase } from '@supabaseDir/supabaseClient'
import dayjs from 'dayjs'
import { formatDate, formatTime } from './GamesHelper'
import DrawerUsersInfo from './ModalGame/DrawerUsersInfo'
// import { get_cookie } from '@utils/auth'

import s from './index.module.scss'

type Props = {
   isArchive?: boolean
}

const Games = ({ isArchive = false }: Props) => {
   const [visibleModalCreate, setVisibleModalCreate] = useState(false)
   const [visibleModalEdit, setVisibleModalEdit] = useState({ visible: false, id: 0 })
   const [visibleModalUsersInfo, setVisibleModalUsersInfo] = useState({ visible: false, id: 0 })
   const [isChangeGame, setChangeGame] = useState(false)
   const [loading, setLoading] = useState(true)
   const [gamesData, setGamesData] = useState<any[]>([])
   const [openConfirm, setOpenConfirm] = useState(false)
   const [userId, setUserId] = useState<number | null>(null)
   const [votes, setVotes] = useState<GameVotes | null>(null)

   useEffect(() => {
      const getUser = async () => {
         setLoading(true)
         // const user_id = get_cookie('user_id')
         const {
            data: { session },
         } = await supabase.auth.getSession()
         const user_id = session?.user.id

         try {
            const { data, error } = await supabase.from('users').select('*').eq('uuid', user_id).single()
            if (error) throw error
            setUserId(data.id)
         } catch (error: any) {
            message.error(error.message)
         } finally {
            setLoading(false)
         }
      }

      getUser()
   }, [])

   useEffect(() => {
      if (!userId) return
      const getVote = async () => {
         setLoading(true)
         try {
            const { data, error } = await supabase.from('votes').select('*').eq('user_id', userId).single()
            if (error) throw error
            setVotes(data)
         } catch (error: any) {
            message.error(error.message)
         } finally {
            setLoading(false)
         }
      }

      getVote()
   }, [userId])

   const getGames = async () => {
      setLoading(true)
      try {
         const { data, error } = await supabase.from('view_games').select('*').eq('is_active', !isArchive)
         if (error) throw error
         data.length && setGamesData(data)
      } catch (error: any) {
         message.error(error.message)
      } finally {
         setLoading(false)
      }
   }

   const insertVotes = async (game_id: number) => {
      setLoading(true)
      try {
         const values = {
            game_id,
            user_id: userId,
         }
         const { error: errorVotes } = await supabase.from('votes').insert(values)
         if (errorVotes) throw errorVotes
         setChangeGame(true)
      } catch (error: any) {
         message.error(error.message)
      } finally {
         setLoading(false)
      }
   }

   const deleteVotes = async (game_id: number) => {
      setLoading(true)
      try {
         const { error: errorVotes } = await supabase.from('votes').delete().eq('game_id', game_id).eq('user_id', userId)
         if (errorVotes) throw errorVotes
         setChangeGame(true)
      } catch (error: any) {
         message.error(error.message)
      } finally {
         setLoading(false)
      }
   }

   useEffect(() => {
      getGames()
   }, [isArchive])

   useEffect(() => {
      if (isChangeGame) {
         getGames()
         setChangeGame(false)
      }
   }, [isChangeGame])

   const handleChangeVisibleModalCreate = (visible: boolean) => setVisibleModalCreate(visible)
   const handleChangeVisibleModalEdit = (visible: boolean, id: number) => setVisibleModalEdit({ visible, id })
   const handleChangeVisibleModalUsersInfo = (visible: boolean, id: number) => setVisibleModalUsersInfo({ visible, id })

   const confirmRecord = (id: number) => {
      setOpenConfirm(false)
      insertVotes(id)
   }

   const deleteRecord = (id: number) => {
      setOpenConfirm(false)
      deleteVotes(id)
   }

   const ExtraText = ({ id, total, limit }: { id: number; total: number; limit: number }) => {
      return (
         <>
            {!isArchive ? (
               <>
                  {total === limit ? (
                     <Badge status="success" text={<span className={s.extraFull}>Нет мест</span>} />
                  ) : (
                     <Badge status="success" text={<span className={s.extraSuccess}>Есть места</span>} />
                  )}
                  <FormOutlined className={s.editGameBtn} onClick={() => handleChangeVisibleModalEdit(true, id)} />
               </>
            ) : (
               // <div>ddd</div>
               <Badge status="default" text={<span className={s.extraClose}>Игра закрыта</span>} />
            )}
         </>
      )
   }

   const DescriptionItems = ({ item }: any) => {
      const gameDate = dayjs(item.game_date).format(formatDate)
      const [startTime, endTime] = item.game_time
      return (
         <Descriptions
            bordered
            items={[
               {
                  key: '1',
                  label: 'Дата игры',
                  children: gameDate,
               },
               {
                  key: '2',
                  label: 'Время игры',
                  children: `${dayjs(startTime).format(formatTime)} - ${dayjs(endTime).format(formatTime)}`,
               },
               {
                  key: '3',
                  label: 'Адрес площадки',
                  children: item.place_address,
               },
               {
                  key: '4',
                  label: 'Лимит игроков',
                  children: item.players_limit,
               },
               {
                  key: '5',
                  label: 'Проголосовало игроков',
                  children: (
                     <Flex justify="space-between">
                        <span style={{ fontWeight: 600 }}>{item.votes_count}</span>
                        {item.votes_count >= 1 && (
                           <Button onClick={() => handleChangeVisibleModalUsersInfo(true, item.id)}>Список</Button>
                        )}
                     </Flex>
                  ),
               },
               {
                  key: '6',
                  label: 'Цена',
                  children: item.game_price,
               },
               {
                  key: '7',
                  label: 'Условия записи',
                  children: (
                     <Flex justify="space-between">
                        <span>Оплата сразу</span>
                        <QuestionCircleOutlined style={{ fontSize: '20px', cursor: 'pointer' }} title="Узнать подробнее" />
                     </Flex>
                  ),
               },
            ]}
            layout="horizontal"
            column={1}
         />
      )
   }

   const ButtonConfirm = ({ item }: any) => {
      if (isArchive) return

      const hasVoted = votes && votes.game_id === item.id

      return hasVoted ? (
         <Popconfirm
            title="Отмена записи"
            description="Подтвердите отмену записи"
            open={openConfirm}
            onConfirm={() => deleteRecord(item.id)}
            okButtonProps={{ loading }}
            onCancel={() => setOpenConfirm(false)}
         >
            <Button
               // type="primary"
               onClick={() => setOpenConfirm(true)}
               style={{ marginTop: '16px', width: '100%' }}
               // disabled={votes}
            >
               Отменить запись
            </Button>
         </Popconfirm>
      ) : (
         <Popconfirm
            title="Запись в игру"
            description="Подтвердите свою запись"
            open={openConfirm}
            onConfirm={() => confirmRecord(item.id)}
            okButtonProps={{ loading }}
            onCancel={() => setOpenConfirm(false)}
         >
            <Button
               type="primary"
               onClick={() => setOpenConfirm(true)}
               style={{ marginTop: '16px', width: '100%' }}
               disabled={item.players_total === item.players_limit}
            >
               Записаться
            </Button>
         </Popconfirm>
      )
   }

   return (
      <div className={s.wrapReserved}>
         {!isArchive ? (
            <Space size="large">
               <h3>Ближайшие игры</h3>
               <Button icon={<PlusOutlined />} onClick={() => handleChangeVisibleModalCreate(true)}>
                  Создать игру
               </Button>
            </Space>
         ) : null}
         {loading ? (
            <Skeleton active />
         ) : (
            <Flex gap={16} wrap className={s.cardWrap}>
               {gamesData.length ? (
                  gamesData.map((item) => (
                     <Card
                        key={item.id}
                        title={item.place_name}
                        extra={<ExtraText id={item.id} total={item.players_total} limit={item.players_limit} />}
                        style={{ width: 550 }}
                     >
                        <DescriptionItems item={item} />
                        <ButtonConfirm item={item} />
                     </Card>
                  ))
               ) : (
                  <Empty description="Нет предстоящих игр" style={{ width: '100%' }} />
               )}
            </Flex>
         )}

         {visibleModalCreate && (
            <ModalCreateGame handleChangeVisibleModal={handleChangeVisibleModalCreate} setChangeGame={setChangeGame} />
         )}
         {visibleModalEdit.visible && (
            <ModalEditGame
               gamesData={gamesData}
               id={visibleModalEdit.id}
               handleChangeVisibleModal={handleChangeVisibleModalEdit}
               setChangeGame={setChangeGame}
            />
         )}
         {visibleModalUsersInfo.visible && (
            <DrawerUsersInfo id={visibleModalUsersInfo.id} handleChangeVisibleModal={handleChangeVisibleModalUsersInfo} />
         )}
      </div>
   )
}
export default Games
