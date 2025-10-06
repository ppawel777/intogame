import { Avatar, Tooltip } from 'antd'
import { useEffect, useState } from 'react'
import { supabase } from '@supabaseDir/supabaseClient'
import { get_avatar_url } from '@utils/storage'

type Player = {
   id: number
   user_name: string
   avatar_url?: string
   status_payment: string
}

type PlayersAvatarsProps = {
   gameId: number
   maxVisible?: number
   size?: number
}

export const PlayersAvatars = ({ gameId, maxVisible = 5, size = 32 }: PlayersAvatarsProps) => {
   const [players, setPlayers] = useState<Player[]>([])
   const [avatarUrls, setAvatarUrls] = useState<Record<string, string>>({})
   const [loading, setLoading] = useState(true)

   useEffect(() => {
      const loadPlayers = async () => {
         try {
            const { data, error } = await supabase
               .from('view_users_from_game')
               .select('id, user_name, avatar_url, status_payment')
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

   const getInitials = (name: string) => {
      return name.charAt(0).toUpperCase()
   }

   const visiblePlayers = players.slice(0, maxVisible)
   const hiddenCount = Math.max(0, players.length - maxVisible)

   if (loading) {
      return <div style={{ height: size, display: 'flex', alignItems: 'center' }}>...</div>
   }

   if (players.length === 0) {
      return null
   }

   return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
         {visiblePlayers.map((player) => (
            <Tooltip key={player.id} title={player.user_name}>
               <Avatar
                  size={size}
                  src={avatarUrls[player.avatar_url || '']}
                  style={{
                     backgroundColor: player.status_payment === 'confirmed' ? '#52c41a' : '#faad14',
                     fontSize: size * 0.4,
                  }}
               >
                  {!avatarUrls[player.avatar_url || ''] && getInitials(player.user_name)}
               </Avatar>
            </Tooltip>
         ))}
         {hiddenCount > 0 && (
            <Tooltip title={`Еще ${hiddenCount} участников`}>
               <Avatar
                  size={size}
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
