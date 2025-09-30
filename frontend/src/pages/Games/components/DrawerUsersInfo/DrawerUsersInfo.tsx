import React from 'react'
import { Avatar, Badge, Button, Drawer, List, Space, message } from 'antd'
import { supabase } from '@supabaseDir/supabaseClient'
import { useEffect, useState } from 'react'
import { LikeOutlined, MessageOutlined, StarOutlined, UserOutlined } from '@ant-design/icons'

import { UserFromGame } from '@typesDir/gameTypes'

type Props = {
   id: number
   onClose: (visible: boolean, id: number) => void
}

const DrawerUsersInfo = ({ id, onClose }: Props) => {
   const [loading, setLoading] = useState(true)
   const [usersList, setUsersList] = useState<UserFromGame[]>([])

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

   const IconText = ({ icon, text }: { icon: React.FC; text: string }) => (
      <Space>
         {React.createElement(icon)}
         {text}
      </Space>
   )

   const UserInfo = ({
      user_name,
      avatar_url,
      status,
   }: {
      user_name: string | null
      avatar_url: string | null
      status: string | null
   }) => {
      const isConfirmed = status === 'confirmed'
      const badgeText = isConfirmed ? 'В игре' : 'Не оплачено'
      const badgeColor = isConfirmed ? 'green' : 'orange'

      return (
         <Badge color={badgeColor} count={badgeText} offset={[30, -12]}>
            <List.Item.Meta
               avatar={<Avatar src={avatar_url} style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />}
               title={user_name}
               description="Описание"
            />
         </Badge>
      )
   }

   return (
      <Drawer
         closable
         // destroyOnClose
         title={<p>Список игроков</p>}
         placement="right"
         open
         loading={loading}
         onClose={() => onClose(false, 0)}
         width="40%"
      >
         <List
            loading={loading}
            itemLayout="horizontal"
            dataSource={usersList}
            renderItem={(item) => (
               <List.Item
                  actions={[
                     <IconText icon={StarOutlined} text="156" key="list-vertical-star-o" />,
                     <IconText icon={LikeOutlined} text="156" key="list-vertical-like-o" />,
                     <IconText icon={MessageOutlined} text="2" key="list-vertical-message" />,
                  ]}
                  extra={<Button>Связаться</Button>}
               >
                  <UserInfo user_name={item.user_name} avatar_url={item.avatar_url} status={item.status_payment} />
               </List.Item>
            )}
         />
      </Drawer>
   )
}

export default DrawerUsersInfo
