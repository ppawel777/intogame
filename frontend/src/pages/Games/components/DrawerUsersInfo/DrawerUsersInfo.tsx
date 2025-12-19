/* eslint-disable @typescript-eslint/no-unused-vars */
import { Avatar, Button, Card, Drawer, Flex, List, Space, Tooltip, Typography, message } from 'antd'
import { supabase } from '@supabaseDir/supabaseClient'
import { useEffect, useState } from 'react'
import { InfoCircleOutlined, MessageOutlined, UserOutlined } from '@ant-design/icons'

import { UserFromGame } from '@typesDir/gameTypes'
import { formatQtyText } from '@pages/Games/utils/games_utils'
import { useAvatars } from '@utils/hooks/useAvatars'

const { Text } = Typography

type Props = {
   id: number
   onClose: (visible: boolean, id: number) => void
}

const DrawerUsersInfo = ({ id, onClose }: Props) => {
   const [loading, setLoading] = useState(true)
   const [usersList, setUsersList] = useState<UserFromGame[]>([])

   // Используем хук для загрузки аватарок с кэшированием
   const avatarUrls = useAvatars(usersList.map((u) => u.avatar_url))

   const getUsers = async () => {
      setLoading(true)
      try {
         const { data, error } = await supabase.from('view_users_from_game').select('*').eq('game_id', id)

         if (error) throw error

         if (data.length) {
            const sorted = data.sort((a, b) => {
               const statusOrder = { confirmed: 0, pending: 1 }
               const statusA = statusOrder[a.status_payment as keyof typeof statusOrder] ?? 2
               const statusB = statusOrder[b.status_payment as keyof typeof statusOrder] ?? 2

               if (statusA !== statusB) {
                  return statusA - statusB
               }

               const nameA = a.user_name?.trim().toLowerCase() || ''
               const nameB = b.user_name?.trim().toLowerCase() || ''

               return nameA.localeCompare(nameB, 'ru')
            })
            setUsersList(sorted)
         }
      } catch (error: any) {
         message.error(error.message)
      } finally {
         setLoading(false)
      }
   }

   useEffect(() => {
      getUsers()
   }, [id])

   const UserInfoTooltipContent = ({ user }: { user: UserFromGame }) => (
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

   return (
      <Drawer
         closable
         title="Список игроков"
         placement="right"
         open
         onClose={() => onClose(false, 0)}
         width={window.innerWidth < 768 ? '90%' : '40%'}
         styles={{
            body: {
               padding: window.innerWidth < 768 ? '8px 20px' : '16px',
            },
         }}
      >
         <List
            loading={loading}
            itemLayout="vertical"
            dataSource={usersList}
            split
            renderItem={(item) => {
               const isConfirmed = item.status_payment === 'confirmed'
               const statusText = isConfirmed ? 'В игре' : 'Не оплачено'
               const statusColor = isConfirmed ? 'success' : 'warning'

               return (
                  <List.Item key={item.id}>
                     <Flex align="center" gap="middle" style={{ width: '100%', padding: '4px 0' }}>
                        <Avatar
                           size={window.innerWidth < 768 ? 60 : 80}
                           src={avatarUrls[item.avatar_url || '']}
                           icon={<UserOutlined />}
                           style={{ backgroundColor: '#87d068' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                           <Flex align="center" gap={8}>
                              <Text strong style={{ fontSize: window.innerWidth < 768 ? '14px' : '16px' }}>
                                 {item.user_name}
                              </Text>
                           </Flex>
                           <div style={{ marginTop: 2 }}>
                              <Text type={statusColor} style={{ fontSize: '12px' }}>
                                 {statusText}
                                 {item.quantity > 1 && (
                                    <span style={{ color: '#999', marginLeft: 4 }}> ({formatQtyText(item.quantity)})</span>
                                 )}
                              </Text>
                           </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                           <Space size={2}>
                              <Tooltip
                                 title={<UserInfoTooltipContent user={item} />}
                                 color="white"
                                 trigger="hover"
                                 placement="right"
                                 mouseEnterDelay={0.3}
                                 mouseLeaveDelay={0.1}
                              >
                                 <InfoCircleOutlined
                                    style={{
                                       fontSize: '18px',
                                       color: '#1890ff',
                                       cursor: 'pointer',
                                       marginTop: '4px',
                                    }}
                                 />
                              </Tooltip>
                              <Button
                                 title="Связаться"
                                 icon={
                                    <MessageOutlined
                                       style={{
                                          fontSize: '18px',
                                       }}
                                    />
                                 }
                                 style={{ border: 'none', outline: 'none' }}
                              />
                           </Space>
                        </div>
                     </Flex>
                  </List.Item>
               )
            }}
         />
      </Drawer>
   )
}

export default DrawerUsersInfo
