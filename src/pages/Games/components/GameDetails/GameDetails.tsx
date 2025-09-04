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
   const [drawerUsers, setDrawerUsers] = useState({ open: false, id: 0 })

   const [start, end] = game.game_time

   const openUsersDrawer = (id: number) => setDrawerUsers({ open: true, id })
   const closeUsersDrawer = () => setDrawerUsers({ open: false, id: 0 })

   return (
      <>
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
         {drawerUsers.open && <DrawerUsersInfo id={drawerUsers.id} onClose={closeUsersDrawer} />}
      </>
   )
}
