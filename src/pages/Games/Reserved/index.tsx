/* eslint-disable @typescript-eslint/no-unused-vars */
import { Badge, Button, Card, Descriptions, Empty, Flex, Skeleton, Space, message } from 'antd'
import { FormOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import ModalCreateGame from './ModalGame/ModalCreateGame'
import ModalEditGame from './ModalGame/ModalEditGame'
import { supabase } from '@supabaseDir/supabaseClient'

import s from './index.module.scss'
import dayjs from 'dayjs'
import { formatDate, formatTime } from './GamesHelper'
import ModalUsersInfo from './ModalGame/ModalUsersInfo'

const ReservedGame = () => {
   const [visibleModalCreate, setVisibleModalCreate] = useState(false)
   const [visibleModalEdit, setVisibleModalEdit] = useState({ visible: false, id: 0 })
   const [visibleModalUsersInfo, setVisibleModalUsersInfo] = useState({ visible: false, id: 0 })
   const [isChangeGame, setChangeGame] = useState(false)
   const [loading, setLoading] = useState(false)
   const [gamesData, setGamesData] = useState<any[]>([])

   const getPlaces = async () => {
      setLoading(true)
      try {
         const { data, error } = await supabase.from('view_games').select('*').eq('is_active', true)
         if (error) throw error
         data.length && setGamesData(data)
      } catch (error: any) {
         message.error(error.message)
      } finally {
         setLoading(false)
      }
   }

   useEffect(() => {
      getPlaces()
   }, [])

   useEffect(() => {
      if (isChangeGame) {
         getPlaces()
         setChangeGame(false)
      }
   }, [isChangeGame])

   const handleChangeVisibleModalCreate = (visible: boolean) => setVisibleModalCreate(visible)
   const handleChangeVisibleModalEdit = (visible: boolean, id: number) => setVisibleModalEdit({ visible, id })
   const handleChangeVisibleModalUsersInfo = (visible: boolean, id: number) => setVisibleModalUsersInfo({ visible, id })

   const ExtraText = ({ id, total, limit }: { id: number; total: number; limit: number }) => {
      return (
         <>
            {total === limit ? (
               <Badge status="success" text={<span className={s.extraFull}>Нет мест</span>} />
            ) : (
               <Badge status="success" text={<span className={s.extraSuccess}>Есть места</span>} />
            )}
            <FormOutlined className={s.editGameBtn} onClick={() => handleChangeVisibleModalEdit(true, id)} />
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

   return (
      <div className={s.wrapReserved}>
         <Space size="large">
            <h3>Ближайшие игры</h3>
            <Button icon={<PlusOutlined />} onClick={() => handleChangeVisibleModalCreate(true)}>
               Создать игру
            </Button>
         </Space>
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
                        <Button type="primary" style={{ marginTop: '16px', width: '100%' }}>
                           Записаться
                        </Button>
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
            <ModalUsersInfo id={visibleModalUsersInfo.id} handleChangeVisibleModal={handleChangeVisibleModalUsersInfo} />
         )}
      </div>
   )
}
export default ReservedGame
