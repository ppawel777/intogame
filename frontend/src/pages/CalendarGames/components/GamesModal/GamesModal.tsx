import { GamesModalProps } from '@pages/CalendarGames/types'
import { Badge, Flex, Modal, Space, Typography, message } from 'antd'
import { ExportOutlined, StarFilled, StarOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@supabaseDir/supabaseClient'

import s from './GamesModal.module.scss'
import { statusToBadgeType } from '@pages/CalendarGames/utils/helpers'
import { formatDate, formatTime } from '@utils/formatDatetime'
import { useIsMobile } from '@utils/hooks/useIsMobile'

const { Text } = Typography

export const GamesModal = ({ isOpen, onClose, games, date, userId }: GamesModalProps) => {
   const [favoriteGames, setFavoriteGames] = useState<number[]>([])
   const [loading, setLoading] = useState(false)
   const navigate = useNavigate()
   const isMobile = useIsMobile()

   const navigateState = { state: { from: { pathname: '/calendar-games', title: 'Календарь игр' } } }

   // Загружаем избранные игры при открытии модала
   useEffect(() => {
      if (isOpen && userId) {
         loadFavoriteGames()
      }
   }, [isOpen, userId])

   const loadFavoriteGames = async () => {
      if (!userId) return

      try {
         const { data, error } = await supabase.from('favorites').select('game_id').eq('user_id', userId)

         if (error) throw error
         setFavoriteGames(data?.map((item) => item.game_id) || [])
      } catch (error: any) {
         console.error('Ошибка загрузки избранного:', error.message)
      }
   }

   const handleAddToFavorites = async (game_id: number) => {
      if (!userId) return

      setLoading(true)
      try {
         const { error } = await supabase.from('favorites').insert([{ user_id: userId, game_id }])

         if (error) throw error

         setFavoriteGames((prev) => [...prev, game_id])
         message.success('Игра добавлена в избранное')
      } catch (error: any) {
         message.error('Ошибка добавления в избранное: ' + error.message)
      } finally {
         setLoading(false)
      }
   }

   const handleRemoveFromFavorites = async (game_id: number) => {
      if (!userId) return

      setLoading(true)
      try {
         const { error } = await supabase.from('favorites').delete().eq('user_id', userId).eq('game_id', game_id)

         if (error) throw error

         setFavoriteGames((prev) => prev.filter((id) => id !== game_id))
         message.success('Игра удалена из избранного')
      } catch (error: any) {
         message.error('Ошибка удаления из избранного: ' + error.message)
      } finally {
         setLoading(false)
      }
   }

   return (
      <Modal
         title={date ? `Игры на ${date.format(formatDate)}` : ''}
         open={isOpen}
         onCancel={onClose}
         footer={null}
         width={isMobile ? '100%' : 520}
         style={isMobile ? { top: 0, paddingBottom: 0 } : {}}
         styles={{ body: { maxHeight: isMobile ? 'calc(100vh - 120px)' : 'auto', overflowY: 'auto' } }}
      >
         <ul className={s.modalList}>
            {games.map((game) => (
               <li key={game.id} className={s.modalItem}>
                  <Flex vertical gap="small" style={{ width: '100%' }}>
                     <Space className={s.modalItemActions} size="middle">
                        {favoriteGames.includes(game.id) ? (
                           <StarFilled
                              title="Удалить из избранного"
                              style={{ fontSize: '20px', cursor: 'pointer', color: '#faad14' }}
                              onClick={() => handleRemoveFromFavorites(game.id)}
                              disabled={loading}
                           />
                        ) : (
                           <StarOutlined
                              title="Добавить в избранное"
                              style={{ fontSize: '20px', cursor: 'pointer' }}
                              onClick={() => handleAddToFavorites(game.id)}
                              disabled={loading}
                           />
                        )}
                        <ExportOutlined
                           title="Перейти к игре"
                           style={{ fontSize: '18px', cursor: 'pointer' }}
                           onClick={() => {
                              onClose()
                              navigate(`/games/${game.id}`, navigateState)
                           }}
                        />
                     </Space>
                     {game.game_time && (
                        <div className={s.modalItemTime}>
                           {dayjs(game.game_time[0]).format(formatTime)} - {dayjs(game.game_time[1]).format(formatTime)}
                        </div>
                     )}
                     <div className={s.modalItemPlace}>{game.place_name}</div>
                     <Badge status={statusToBadgeType[game.game_status || '']} text={game.game_status} />
                     <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                        <div style={{ flex: 1 }}>
                           {game.game_status === 'Активна' && <div>Участников: {game.confirmed_count}</div>}
                        </div>
                        {game.game_status === 'Активна' && (
                           <Text style={{ color: 'green' }}>
                              {game.players_min && game.players_min > 0 && game.game_price
                                 ? Math.ceil(game.game_price / game.players_min)
                                 : '—'}{' '}
                              ₽
                           </Text>
                        )}
                     </Flex>
                  </Flex>
               </li>
            ))}
         </ul>
      </Modal>
   )
}
