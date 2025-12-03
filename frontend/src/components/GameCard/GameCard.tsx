/* eslint-disable @typescript-eslint/no-unused-vars */
import { Col, Flex, Row, Space, Typography } from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import { useNavigate } from 'react-router-dom'

import { GameType } from '@typesDir/gameTypes'
import { PlayersAvatars } from '@components/PlayersAvatars'
import { MapButton } from '@components/MapButton'
import { CardExtra } from '@components/GameCard/CardExtra/CardExtra'
import { formatDate, formatTime } from '@utils/formatDatetime'

import { useIsMobile } from '@utils/hooks/useIsMobile'
import CardFooter from './CardFooter/CardFooter'
import { EditOutlined } from '@ant-design/icons'

import s from './GameCard.module.scss'

dayjs.locale('ru')

const { Text } = Typography

type GameCardProps = {
   game: GameType
   userId: number | null
   onEdit?: (e: React.MouseEvent, id: number) => void
   setLoading: React.Dispatch<React.SetStateAction<boolean>>
   refresh: () => void
   navigateState?: { state: { from: { pathname: string; title: string } } }
}

export const GameCard = ({ game, userId, onEdit, setLoading, refresh, navigateState }: GameCardProps) => {
   const {
      id,
      game_date,
      game_time,
      place_name,
      place_address,
      confirmed_count,
      players_limit,
      players_min,
      game_price,
      creator_id,
   } = game

   const [start, end] = game_time || ['', '']
   const gameDate = dayjs(game_date)
   const dayOfWeek = gameDate.format('dddd')
   const formattedDate = gameDate.format(formatDate)
   const formattedTime = `${dayjs(start).format(formatTime)} - ${dayjs(end).format(formatTime)}`

   const isMobile = useIsMobile()
   const navigate = useNavigate()

   const handleCardClick = () => {
      navigate(`/games/${id}`, navigateState)
   }

   return (
      <Row className={s.gameCard} onClick={handleCardClick}>
         {/* Левая часть */}
         <Col span={isMobile ? 8 : 6}>
            <div className={s.date}>
               <Text className={s.dayOfWeek}>{dayOfWeek}</Text>
               <Text className={s.dateText}>{formattedDate}</Text>
               <Text className={s.timeText}>{formattedTime}</Text>
            </div>
            <div className={s.statusSection}>
               <CardExtra confirmedCount={confirmed_count} playersLimit={players_limit} />
            </div>
         </Col>

         {/* Правая часть */}
         <Col className={s.gameInfo} span={isMobile ? 16 : 18}>
            <Flex vertical gap={16}>
               <Flex justify="space-between">
                  <h3 style={{ margin: 0 }}>{place_name}</h3>
                  {userId === creator_id && (
                     <EditOutlined
                        style={{ cursor: 'pointer', fontSize: 20, color: '#1890ff' }}
                        onClick={(e) => onEdit?.(e, id)}
                     />
                  )}
               </Flex>
               <Space>
                  <span>{place_address}</span>
                  <MapButton address={place_address} />
               </Space>
               <div className={s.playersSection}>
                  <PlayersAvatars gameId={id} size={isMobile ? 28 : 32} />
               </div>
               <p>В игре: {confirmed_count}</p>
            </Flex>
         </Col>
         <CardFooter players_min={players_min} game_price={game_price} />
      </Row>
   )
}
