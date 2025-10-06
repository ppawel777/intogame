/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react'
import { Button, Descriptions, Flex, Tooltip, Typography } from 'antd'
import dayjs from 'dayjs'

import { GameType } from '@typesDir/gameTypes'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { DrawerUsersInfo } from '..'
import { GameProgress } from '@components/GameProgress'
import { PlayersAvatars } from '@components/PlayersAvatars'
import { formatDate, formatTime } from '@utils/formatDatetime'
import { supabase } from '@supabaseDir/supabaseClient'

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
      votes_count,
      id,
      game_price,
      confirmed_count,
      reserved_count,
   } = game

   const [drawerUsers, setDrawerUsers] = useState({ open: false, id: 0 })
   // const [totalPlayers, setTotalPlayers] = useState(0)

   const [start, end] = game_time || ['', '']

   const openUsersDrawer = (id: number) => setDrawerUsers({ open: true, id })
   const closeUsersDrawer = () => setDrawerUsers({ open: false, id: 0 })

   const isMobile = window.innerWidth < 768

   // useEffect(() => {
   //    const loadPlayersCount = async () => {
   //       try {
   //          const { count, error } = await supabase
   //             .from('view_users_from_game')
   //             .select('*', { count: 'exact', head: true })
   //             .eq('game_id', id)

   //          if (error) throw error
   //          setTotalPlayers(count || 0)
   //       } catch (error) {
   //          console.error('Ошибка загрузки количества участников:', error)
   //       }
   //    }

   //    loadPlayersCount()
   // }, [id])

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

            {/* <Descriptions.Item label="Лимит игроков">{players_limit}</Descriptions.Item> */}

            <Descriptions.Item label="Участников">
               <Flex
                  vertical={isMobile}
                  justify="flex-start"
                  align="flex-start"
                  gap={isMobile ? 4 : 12}
                  style={{ width: '100%' }}
               >
                  <div style={{ width: '100%' }}>
                     {/* <GameProgress confirmedCount={confirmed_count} playersLimit={players_limit} /> */}
                     {reserved_count > 0 && (
                        <div style={{ fontSize: '12px', color: '#999', marginTop: 2 }}>
                           Подтверждение оплаты: {reserved_count}
                        </div>
                     )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 8 }}>
                     <PlayersAvatars gameId={id} maxVisible={4} size={isMobile ? 28 : 32} />
                     {/* {confirmed_count > 0 && (
                        <Text style={{ fontSize: '14px', color: '#666' }}>
                           {confirmed_count} из {players_limit || 0} чел
                        </Text>
                     )} */}
                  </div>
               </Flex>
            </Descriptions.Item>

            {/* <Descriptions.Item label="Цена аренды">{game_price} ₽</Descriptions.Item> */}

            <Descriptions.Item label="Цена взноса">
               <Text style={{ color: 'green' }}>
                  {players_limit && players_limit > 0 && game_price ? Math.ceil(game_price / players_limit) : '—'} ₽
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
