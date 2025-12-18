/* eslint-disable @typescript-eslint/no-unused-vars */
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Breadcrumb, Button, Card, Col, Row, Skeleton, Space, message } from 'antd'
// import { ArrowLeftOutlined } from '@ant-design/icons'
import { supabase } from '@supabaseDir/supabaseClient'
import { GameType } from '@typesDir/gameTypes'
import { AboutGame } from '@pages/Games/components/AboutGame/AboutGame'
import { ActionButton } from '@pages/Games/components/ActionButton/ActionButton'
import { useUserId } from '@utils/hooks/useUserId'
import { useIsMobile } from '@utils/hooks/useIsMobile'
import s from './GamesDetails.module.scss'
import { CostBlock, DateTimeBlock, GamerListBlock, PlaceInfoBlock, PlaceNameBlock } from './components'

type LocationState = {
   from?: {
      pathname: string
      title: string
   }
}

const GamesDetails = () => {
   const { initId } = useParams<{ initId: string }>()
   const [game, setGame] = useState<GameType | null>(null)
   const [loading, setLoading] = useState(true)
   const { userId } = useUserId()
   const navigate = useNavigate()
   const isMobile = useIsMobile()

   const location = useLocation()
   const locationState = location.state as LocationState | null
   const from = locationState?.from

   useEffect(() => {
      const fetchGame = async () => {
         if (!initId) return

         try {
            const { data, error } = await supabase.from('view_games').select('*').eq('id', parseInt(initId)).single()

            if (error) throw error
            setGame(data)
         } catch (error: any) {
            message.error('Ошибка загрузки игры: ' + error.message)
         } finally {
            setLoading(false)
         }
      }

      fetchGame()
   }, [initId])

   const refresh = () => {
      // Перезагружаем данные игры
      if (initId) {
         setLoading(true)
         const fetchGame = async () => {
            try {
               const { data, error } = await supabase.from('view_games').select('*').eq('id', parseInt(initId)).single()

               if (error) throw error
               setGame(data)
            } catch (error: any) {
               message.error('Ошибка загрузки игры: ' + error.message)
            } finally {
               setLoading(false)
            }
         }
         fetchGame()
      }
   }

   if (loading) {
      return <Skeleton active paragraph={{ rows: 8 }} />
   }

   if (!game) {
      return <div>Игра не найдена</div>
   }

   return (
      <div style={{ width: '100%' }}>
         <Breadcrumb style={{ marginBottom: '16px' }}>
            {from ? (
               <>
                  <Breadcrumb.Item>
                     <span onClick={() => navigate(from.pathname)} style={{ cursor: 'pointer' }}>
                        {from.title}
                     </span>
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>Игра #{game.id}</Breadcrumb.Item>
               </>
            ) : (
               <Breadcrumb.Item>Игра #{game.id}</Breadcrumb.Item>
            )}
         </Breadcrumb>

         <Row justify="center">
            <Col xs={24} lg={20}>
               <div className={s.blockWrapper}>
                  <PlaceNameBlock place_name={game.place_name} place_address={game.place_address} />
               </div>
               <div className={s.blockWrapper}>
                  <DateTimeBlock game_time={game.game_time} game_date={game.game_date} />
               </div>
               <div className={s.blockWrapper}>
                  <GamerListBlock
                     confirmed_players_count={game.confirmed_count}
                     creator_id={game.creator_id}
                     players_min={game.players_min}
                     players_limit={game.players_limit}
                     gameId={game.id}
                     game_status={game.game_status}
                  />
               </div>
               <div className={s.blockWrapper}>
                  <CostBlock
                     game_price={game.game_price}
                     players_min={game.players_min}
                     game={game}
                     setLoading={setLoading}
                     userId={userId}
                     refresh={refresh}
                  />
               </div>
               <div className={s.blockWrapper}>
                  <PlaceInfoBlock />
               </div>
            </Col>
         </Row>
      </div>
   )
}

export default GamesDetails
