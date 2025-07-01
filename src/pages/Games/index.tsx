import { Badge, Button, Card, Descriptions, Empty, Flex, Popconfirm, Skeleton, Space, message } from 'antd'
import { FormOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useAuth } from '@context/providers/AuthProvider/AuthProvider'
import ModalCreateGame from './ModalGame/ModalCreateGame'
import ModalEditGame from './ModalGame/ModalEditGame'
import dayjs from 'dayjs'
import { formatDate, formatTime } from './GamesHelper'
import DrawerUsersInfo from './ModalGame/DrawerUsersInfo'
import { useCustomQuery } from '@hooks/useCustomQuery'
import { useDeleteVotes, useInsertVotes, useSelectGames, useSelectVotes } from '@hooks/games/useSupabaseGames'

import s from './index.module.scss'

type Props = {
   isArchive?: boolean
}

const fetchVotes = async (user_id: number) => {
   try {
      const { data, error } = await useSelectVotes(user_id)
      if (error) throw error
      return data
   } catch (error: any) {
      message.error(error.message)
      return null
   }
}

const Games = ({ isArchive = false }: Props) => {
   const [visibleModalCreate, setVisibleModalCreate] = useState(false)
   const [visibleModalEdit, setVisibleModalEdit] = useState({ visible: false, id: 0 })
   const [visibleModalUsersInfo, setVisibleModalUsersInfo] = useState({ visible: false, id: 0 })
   const [isChangeGame, setChangeGame] = useState(false)
   const [loading, setLoading] = useState(true)
   const [gamesData, setGamesData] = useState<any[]>([])
   const [openConfirm, setOpenConfirm] = useState(false)

   const { userData } = useAuth()

   const {
      data: votes,
      isLoading: loadingVotes,
      refetch: refetchVotes,
      isError,
      error,
   } = useCustomQuery({
      queryKey: ['votes', userData?.id],
      queryFn: () => userData && fetchVotes(userData.id),
      enabled: !!userData?.id,
   })

   const getGames = async () => {
      setLoading(true)
      try {
         const { data, error } = await useSelectGames(isArchive)
         if (error) throw error
         data && setGamesData(data)
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
            user_id: userData?.id,
         }
         const { error } = await useInsertVotes(values)
         if (error) throw error
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
         const { error } = await useDeleteVotes(game_id, userData?.id as number)
         if (error) throw error
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
         refetchVotes()
         setChangeGame(false)
      }
   }, [isChangeGame, refetchVotes])

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
                  key: '3',
                  label: 'Лимит игроков',
                  children: item.players_limit,
               },
               {
                  key: '3',
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
                  key: '4',
                  label: 'Цена',
                  children: item.game_price,
               },
               {
                  key: '5',
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
      return votes ? (
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

   if (loading || loadingVotes) {
      return <Skeleton active />
   }

   if (isError) {
      return (
         <div style={{ margin: '20px 0' }}>
            <p>Ошибка загрузки данных: {error.message}</p>
            <Button onClick={() => refetchVotes()}>Повторить попытку</Button>
         </div>
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
