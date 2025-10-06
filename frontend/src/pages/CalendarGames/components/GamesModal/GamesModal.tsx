import { GamesModalProps } from '@pages/CalendarGames/types'
import { Badge, Flex, Modal, Space, Typography, message } from 'antd'
import { ExportOutlined, StarFilled, StarOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { supabase } from '@supabaseDir/supabaseClient'

import s from './GamesModal.module.scss'
import { statusToBadgeType } from '@pages/CalendarGames/utils/helpers'
import { GameProgress } from '@components/GameProgress'

const { Text } = Typography

export const GamesModal = ({ isOpen, onClose, games, date, userId }: GamesModalProps) => {
   const [favoriteGames, setFavoriteGames] = useState<number[]>([])
   const [loading, setLoading] = useState(false)

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
      <Modal title={date ? `Игры на ${date.format('DD-MM-YYYY')}` : ''} open={isOpen} onCancel={onClose} footer={null}>
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
                        <ExportOutlined style={{ fontSize: '18px', cursor: 'pointer' }} />
                     </Space>
                     {game.game_time && (
                        <div className={s.modalItemTime}>
                           {dayjs(game.game_time[0]).format('HH:mm')} - {dayjs(game.game_time[1]).format('HH:mm')}
                        </div>
                     )}
                     <div className={s.modalItemPlace}>{game.place_name}</div>
                     <Badge status={statusToBadgeType[game.game_status || '']} text={game.game_status} />
                     <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                        <div style={{ flex: 1 }}>
                           {game.game_status === 'Активна' && (
                              <GameProgress
                                 confirmedCount={game.confirmed_count}
                                 playersLimit={game.players_limit}
                                 strokeWidth={10}
                                 maxWidth="30%"
                              />
                           )}
                        </div>
                        {game.game_status === 'Активна' && (
                           <Text style={{ color: 'green' }}>
                              {game.players_limit && game.players_limit > 0 && game.game_price
                                 ? Math.ceil(game.game_price / game.players_limit)
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
