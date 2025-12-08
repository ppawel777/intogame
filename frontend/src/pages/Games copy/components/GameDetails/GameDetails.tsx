import { useState } from 'react'
import { Button, Descriptions, Flex, Tooltip, Typography } from 'antd'
import dayjs from 'dayjs'

import { GameType } from '@typesDir/gameTypes'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { formatDate, formatTime } from '../gameComponentHelpers'
import { DrawerUsersInfo } from '..'
import { GameProgress } from '@components/GameProgress'

const { Text } = Typography

type GameDetailsProps = {
   game: GameType
}

export const GameDetails = ({ game }: GameDetailsProps) => {
   const {
      game_time,
      game_date,
      place_address,
      players_limit,
      players_min,
      votes_count,
      id,
      game_price,
      confirmed_count,
      reserved_count,
   } = game

   const [drawerUsers, setDrawerUsers] = useState({ open: false, id: 0 })

   const [start, end] = game_time || ['', '']

   const openUsersDrawer = (id: number) => setDrawerUsers({ open: true, id })
   const closeUsersDrawer = () => setDrawerUsers({ open: false, id: 0 })

   const isMobile = window.innerWidth < 768

   return (
      <>
         <Descriptions
            bordered
            column={1}
            // size={isMobile ? 'small' : 'default'}
            size="small"
            style={{ fontSize: isMobile ? '14px' : '16px' }}
         >
            <Descriptions.Item label="Дата игры">{dayjs(game_date).format(formatDate)}</Descriptions.Item>

            <Descriptions.Item label="Время игры">
               {dayjs(start).format(formatTime)} – {dayjs(end).format(formatTime)}
            </Descriptions.Item>

            <Descriptions.Item label="Адрес">
               <Text style={{ fontSize: isMobile ? '14px' : '16px', wordBreak: 'break-word' }}>{place_address}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="Лимит игроков">{players_limit}</Descriptions.Item>

            <Descriptions.Item label="Участников">
               <Flex
                  vertical={isMobile}
                  justify="space-between"
                  align={isMobile ? 'flex-start' : 'center'}
                  gap={isMobile ? 4 : 12}
                  style={{ width: '100%' }}
               >
                  <div style={{ width: '100%' }}>
                     <GameProgress confirmedCount={confirmed_count} playersLimit={players_limit} />
                     {reserved_count > 0 && (
                        <div style={{ fontSize: '12px', color: '#999', marginTop: 2 }}>
                           Подтверждение оплаты: {reserved_count}
                        </div>
                     )}
                  </div>

                  {(votes_count > 0 || reserved_count > 0) && (
                     <Button
                        // type="primary"
                        size={isMobile ? 'small' : 'middle'}
                        onClick={() => openUsersDrawer(id)}
                        style={{
                           minWidth: isMobile ? 'auto' : '80px',
                           // padding: isMobile ? '0 8px' : undefined,
                           height: isMobile ? 28 : undefined,
                           marginTop: isMobile ? 8 : 0,
                        }}
                     >
                        Показать
                     </Button>
                  )}
               </Flex>
            </Descriptions.Item>

            <Descriptions.Item label="Цена аренды">{game_price} ₽</Descriptions.Item>

            <Descriptions.Item label="Цена взноса">
               <Text style={{ color: 'green' }}>
                  {players_min && players_min > 0 && game_price ? Math.ceil(game_price / players_min) : '—'} ₽
               </Text>
            </Descriptions.Item>

            <Descriptions.Item label="Условия">
               <Flex justify="space-between" align="center">
                  <span>Оплата сразу</span>
                  <Tooltip title="После брони места необходимо оплатить в течение 1 часа, иначе бронь будет снята">
                     <QuestionCircleOutlined
                        style={{
                           fontSize: isMobile ? 18 : 20,
                           color: '#1890ff',
                           cursor: 'pointer',
                        }}
                     />
                  </Tooltip>
               </Flex>
            </Descriptions.Item>
         </Descriptions>

         {drawerUsers.open && <DrawerUsersInfo id={drawerUsers.id} onClose={closeUsersDrawer} />}
      </>
   )
}
