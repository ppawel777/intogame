/* eslint-disable max-len */
import { useState } from 'react'
import { Button, Descriptions, Flex, Tooltip } from 'antd'
import dayjs from 'dayjs'

import { GameType } from '@typesDir/gameTypes'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { formatDate, formatTime } from '../gameComponentHelpers'
import { DrawerUsersInfo } from '..'

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

   const [start, end] = game_time

   const openUsersDrawer = (id: number) => setDrawerUsers({ open: true, id })
   const closeUsersDrawer = () => setDrawerUsers({ open: false, id: 0 })

   return (
      <>
         <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Дата игры">{dayjs(game_date).format(formatDate)}</Descriptions.Item>
            <Descriptions.Item label="Время игры">
               {dayjs(start).format(formatTime)} – {dayjs(end).format(formatTime)}
            </Descriptions.Item>
            <Descriptions.Item label="Адрес">{place_address}</Descriptions.Item>
            <Descriptions.Item label="Лимит игроков">{players_limit}</Descriptions.Item>
            <Descriptions.Item label="Участников">
               <Flex justify="space-between" align="center">
                  <div>
                     В игре: <strong>{confirmed_count}</strong>
                     <span style={{ display: 'block', fontSize: '12px', color: '#999' }}>
                        Подтверждение оплаты: {reserved_count}
                     </span>
                  </div>
                  {votes_count > 0 && (
                     <Button size="small" onClick={() => openUsersDrawer(id)}>
                        Список
                     </Button>
                  )}
               </Flex>
            </Descriptions.Item>
            <Descriptions.Item label="Цена аренды площадки">{game_price} ₽</Descriptions.Item>
            <Descriptions.Item label="Цена взноса">
               <span style={{ color: 'green' }}>{players_limit > 0 ? Math.ceil(game_price / players_limit) : '—'} ₽</span>
            </Descriptions.Item>
            {/* <Descriptions.Item label="Цена взноса">
               {game.votes_count > 0 ? (
                  <>
                     <strong>{Math.ceil(game.game_price / game.players_limit)} ₽</strong>
                     {game.votes_count !== game.players_limit && (
                        <span style={{ display: 'block', fontSize: '12px', color: '#999' }}>
                           Оригинально: {Math.ceil(game.game_price / game.players_limit)} ₽ ({game.players_limit} чел.)
                        </span>
                     )}
                  </>
               ) : (
                  '—'
               )}
            </Descriptions.Item> */}
            {/* <Descriptions.Item label="Цена взноса">
               {game.votes_count > 0 ? (
                  <>
                     <strong>{Math.ceil(game.game_price / game.votes_count)} ₽</strong> (для {game.votes_count} игроков)
                     {game.votes_count !== game.players_limit && (
                        <span style={{ display: 'block', fontSize: '12px', color: '#999' }}>
                           Оригинально: {Math.ceil(game.game_price / game.players_limit)} ₽ ({game.players_limit} чел.)
                        </span>
                     )}
                  </>
               ) : (
                  '—'
               )}
            </Descriptions.Item> */}
            <Descriptions.Item label="Условия">
               <Flex justify="space-between" align="center">
                  <span>Оплата сразу</span>
                  <Tooltip title="После резервирования места, необходимо оплатить игру в течении 10 мин., иначе бронь будет автоматически снята">
                     <QuestionCircleOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                  </Tooltip>
               </Flex>
            </Descriptions.Item>
         </Descriptions>
         {drawerUsers.open && <DrawerUsersInfo id={drawerUsers.id} onClose={closeUsersDrawer} />}
      </>
   )
}
