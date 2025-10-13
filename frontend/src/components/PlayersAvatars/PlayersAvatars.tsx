import { Avatar, Badge, Tooltip } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@supabaseDir/supabaseClient'
import { get_avatar_url } from '@utils/storage'
import { getRandomColor } from '@utils/colors'

import s from './PlayersAvatars.module.scss'

type Player = {
   id: number
   user_name: string
   avatar_url?: string
   status_payment: string
   quantity: number
}

type PlayersAvatarsProps = {
   gameId: number
   size?: number
}

export const PlayersAvatars = ({ gameId, size = 32 }: PlayersAvatarsProps) => {
   const [players, setPlayers] = useState<Player[]>([])
   const [avatarUrls, setAvatarUrls] = useState<Record<string, string>>({})
   const [loading, setLoading] = useState(true)
   const [maxVisible, setMaxVisible] = useState(5)
   const containerRef = useRef<HTMLDivElement>(null)

   useEffect(() => {
      const loadPlayers = async () => {
         try {
            const { data, error } = await supabase
               .from('view_users_from_game')
               .select('id, user_name, avatar_url, status_payment, quantity')
               .eq('game_id', gameId)

            if (error) throw error

            const sortedPlayers = (data || []).sort((a, b) => {
               const statusOrder = { confirmed: 0, pending: 1 }
               const statusA = statusOrder[a.status_payment as keyof typeof statusOrder] ?? 2
               const statusB = statusOrder[b.status_payment as keyof typeof statusOrder] ?? 2
               return statusA - statusB
            })

            setPlayers(sortedPlayers)
         } catch (error) {
            console.error('Ошибка загрузки участников:', error)
         } finally {
            setLoading(false)
         }
      }

      loadPlayers()
   }, [gameId])

   useEffect(() => {
      players.forEach(async (player) => {
         if (player.avatar_url) {
            const url = await get_avatar_url(player.avatar_url)
            if (url) {
               setAvatarUrls((prev) => ({ ...prev, [player.avatar_url!]: url }))
            }
         }
      })
   }, [players])

   useEffect(() => {
      const calculateMaxVisible = () => {
         if (!containerRef.current) return

         const containerWidth = containerRef.current.offsetWidth
         const avatarWithGap = size + 2 // size + gap
         const maxFit = Math.floor(containerWidth / avatarWithGap)

         // Оставляем место для "+N" аватара если есть скрытые
         const availableForPlayers = players.length > maxFit ? maxFit - 1 : maxFit
         setMaxVisible(Math.max(1, availableForPlayers))
      }

      calculateMaxVisible()

      const resizeObserver = new ResizeObserver(calculateMaxVisible)
      if (containerRef.current) {
         resizeObserver.observe(containerRef.current)
      }

      return () => resizeObserver.disconnect()
   }, [size, players.length])

   const getInitials = (name: string) => {
      return name.charAt(0).toUpperCase()
   }

   const visiblePlayers = players.slice(0, maxVisible)
   const hiddenCount = Math.max(0, players.length - maxVisible)

   if (loading) {
      return (
         <div className={s.loading} style={{ height: size }}>
            ...
         </div>
      )
   }

   if (players.length === 0) {
      return null
   }

   return (
      <div ref={containerRef} className={s.container}>
         {visiblePlayers.map((player) => (
            <Tooltip key={player.id} title={player.user_name}>
               <Badge count={player.quantity > 1 ? player.quantity : 0} offset={[-5, 5]}>
                  <Avatar
                     size={size}
                     src={avatarUrls[player.avatar_url || '']}
                     className={s.avatar}
                     style={{
                        backgroundColor: avatarUrls[player.avatar_url || '']
                           ? player.status_payment === 'confirmed'
                              ? '#52c41a'
                              : '#faad14'
                           : getRandomColor(player.user_name),
                        fontSize: size * 0.4,
                     }}
                  >
                     {!avatarUrls[player.avatar_url || ''] && getInitials(player.user_name)}
                  </Avatar>
               </Badge>
            </Tooltip>
         ))}
         {hiddenCount > 0 && (
            <Tooltip title={`Еще ${hiddenCount} участников`}>
               <Avatar
                  size={size}
                  className={s.avatar}
                  style={{
                     backgroundColor: '#d9d9d9',
                     fontSize: size * 0.4,
                     color: '#666',
                  }}
               >
                  +{hiddenCount}
               </Avatar>
            </Tooltip>
         )}
      </div>
   )
}
