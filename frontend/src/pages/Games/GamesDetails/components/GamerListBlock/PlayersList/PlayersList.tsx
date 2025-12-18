/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import { Avatar, Button, Card, Collapse, List, Modal, Space, Tooltip } from 'antd'
import { useEffect, useState } from 'react'
import { supabase } from '@supabaseDir/supabaseClient'
import { get_avatar_url } from '@utils/storage'
import { getRandomColor } from '@utils/colors'
import { useIsMobile } from '@utils/hooks/useIsMobile'
import { CheckCircleOutlined, MessageOutlined } from '@ant-design/icons'
import { DrawerChat } from './DrawerChat'

import s from './PlayersList.module.scss'

type Player = {
   id: number
   user_name: string
   avatar_url?: string
   status_payment: string
   quantity: number
   first_name?: string
   last_name?: string
   skill_level?: string
   position?: string
   birth_year?: number
}

type Props = {
   gameId: number
   confirmed_players_count: number | null
   players_limit: number | null
   game_status?: string | null
}

export const PlayersList = ({ gameId, confirmed_players_count, players_limit, game_status }: Props) => {
   const [players, setPlayers] = useState<Player[]>([])
   const [avatarUrls, setAvatarUrls] = useState<Record<string, string>>({})
   const [loading, setLoading] = useState(true)
   const [modalVisible, setModalVisible] = useState(false)
   const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
   const [chatOpen, setChatOpen] = useState(false)
   const isMobile = useIsMobile()

   useEffect(() => {
      const loadPlayers = async () => {
         try {
            const { data, error } = await supabase
               .from('view_users_from_game')
               .select(
                  'id, user_name, avatar_url, status_payment, quantity, first_name, last_name, skill_level, position, birth_year',
               )
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

   const handlePlayerClick = (player: Player) => {
      setSelectedPlayer(player)
      setModalVisible(true)
   }

   const UserInfoContent = ({ user }: { user: Player }) => (
      <Card size="small" style={{ border: 'none', padding: '0', margin: '0' }}>
         <div style={{ fontSize: '13px' }}>
            {user.first_name && user.last_name && (
               <p style={{ marginBottom: '8px' }}>
                  <strong>
                     {user.first_name} {user.last_name}
                  </strong>
               </p>
            )}
            <p>
               <strong>Уровень:</strong> {user.skill_level ?? '-'}
            </p>
            <p>
               <strong>Позиция:</strong> {user.position ?? '-'}
            </p>
            <p>
               <strong>Год рождения:</strong> {user.birth_year ?? '-'}
            </p>
            <p>
               <strong>Рейтинг: - </strong>
            </p>
            <p>
               <strong>Игр: - </strong>
            </p>
         </div>
      </Card>
   )

   const genExtra = () => (
      <Button
         onClick={(event) => {
            event.stopPropagation()
            setChatOpen(true)
         }}
         disabled={game_status !== 'Активна'}
         icon={<MessageOutlined style={{ fontSize: '16px', outline: 'none!important', border: 'none!important' }} />}
      >
         {!isMobile && 'Чат с игроками'}
      </Button>
   )

   return (
      <>
         <Collapse
            defaultActiveKey={['1']}
            ghost
            className={s.playerCollapse}
            style={{ alignItems: 'center' }}
            items={[
               {
                  key: '1',
                  label: (
                     <span>
                        Участники (<strong>{confirmed_players_count}</strong> из <strong>{players_limit}</strong>)
                     </span>
                  ),
                  children: (
                     <List
                        grid={{
                           // gutter: 8,
                           xs: 2,
                           sm: 2,
                           md: 3,
                           lg: 3,
                           xl: 3,
                           xxl: 3,
                        }}
                        dataSource={players}
                        loading={loading}
                        renderItem={(player) => (
                           <List.Item key={player.id}>
                              <List.Item.Meta
                                 avatar={
                                    <Avatar
                                       size={isMobile ? 34 : 50}
                                       src={avatarUrls[player.avatar_url || '']}
                                       style={{
                                          backgroundColor: avatarUrls[player.avatar_url || '']
                                             ? player.status_payment === 'confirmed'
                                                ? '#52c41a'
                                                : '#faad14'
                                             : getRandomColor(player.user_name),
                                       }}
                                    >
                                       {!avatarUrls[player.avatar_url || ''] && getInitials(player.user_name)}
                                    </Avatar>
                                 }
                                 title={
                                    <Space style={{ marginTop: '8px' }}>
                                       <Tooltip title={player.status_payment === 'confirmed' ? 'Подтвержден' : 'Ожидает'}>
                                          <CheckCircleOutlined
                                             style={{
                                                color: player.status_payment === 'confirmed' ? '#52c41a' : '#faad14',
                                             }}
                                          />
                                       </Tooltip>
                                       <span className={s.userName} onClick={() => handlePlayerClick(player)}>
                                          {player.user_name}
                                       </span>
                                    </Space>
                                 }
                                 description={
                                    player.quantity > 1 ? <p className={s.statusText}>Мест: {player.quantity}</p> : ''
                                 }
                              />
                           </List.Item>
                        )}
                     />
                  ),
                  extra: genExtra(),
               },
            ]}
         />

         <Modal
            title={selectedPlayer?.user_name}
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={null}
            width={400}
         >
            {selectedPlayer && <UserInfoContent user={selectedPlayer} />}
         </Modal>

         <DrawerChat open={chatOpen} onClose={() => setChatOpen(false)} gameId={gameId} />
      </>
   )
}
