/* eslint-disable @typescript-eslint/no-unused-vars */
import { Badge, Button, Card, Descriptions, DescriptionsProps, Empty, Flex, Skeleton, Space, message } from 'antd'
import { FormOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import ModalCreateGame from './ModalCreateGame/ModalCreateGame'
import { supabase } from '@supabaseDir/supabaseClient'

import s from './index.module.scss'

const ReservedGame = () => {
   const [visibleModal, setVisibleModal] = useState(false)
   const [isChangeGame, setChangeGame] = useState(false)
   const [loading, setLoading] = useState(false)
   const [gamesData, setGamesData] = useState<any[]>([])

   const getPlaces = async () => {
      setLoading(true)
      try {
         const { data, error } = await supabase.from('customer_games').select('*')
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

   const handleChangeVisibleModal = (visible: boolean) => setVisibleModal(visible)

   const ExtraText = ({ total, limit }: { total: number; limit: number }) => {
      return (
         <>
            {total === limit ? (
               <Badge status="success" text={<span className={s.extraFull}>Нет мест</span>} />
            ) : (
               <Badge status="success" text={<span className={s.extraSuccess}>Есть места</span>} />
            )}
            <FormOutlined className={s.editGameBtn} />
         </>
      )
   }

   const DescriptionItems = ({ item }: any) => {
      return (
         <Descriptions
            bordered
            items={[
               {
                  key: '1',
                  label: 'Дата игры',
                  children: item.game_date,
               },
               {
                  key: '2',
                  label: 'Время игры',
                  children: item.game_time,
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
                        <span style={{ fontWeight: 600 }}>{item.players_total}</span>
                        {item.players_total >= 1 && <Button>Список</Button>}
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
            <Button icon={<PlusOutlined />} onClick={() => handleChangeVisibleModal(true)}>
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
                        extra={<ExtraText total={item.players_total} limit={item.players_limit} />}
                        style={{ width: 550 }}
                     >
                        <DescriptionItems item={item} />
                        <Button type="primary" style={{ marginTop: '16px', width: '100%' }}>
                           Записаться
                        </Button>
                     </Card>
                  ))
               ) : (
                  <Empty description="Нет предстоящих игр" />
               )}
            </Flex>
         )}

         {visibleModal && (
            <ModalCreateGame handleChangeVisibleModal={handleChangeVisibleModal} setChangeGame={setChangeGame} />
         )}
      </div>
   )
}
export default ReservedGame
