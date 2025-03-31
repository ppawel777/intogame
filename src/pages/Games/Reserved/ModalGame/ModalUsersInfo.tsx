/* eslint-disable @typescript-eslint/no-unused-vars */
import { Avatar, Button, Drawer, List, Modal, Space, message } from 'antd'
import { supabase } from '@supabaseDir/supabaseClient'
import { useEffect, useState } from 'react'
import { LikeOutlined, MessageOutlined, StarOutlined, UserOutlined } from '@ant-design/icons'
import React from 'react'

type Props = {
   id: number
   handleChangeVisibleModal: (visible: boolean, id: number) => void
}

const ModalUsersInfo = ({ id, handleChangeVisibleModal }: Props) => {
   const [loading, setLoading] = useState(true)
   const [usersList, setUsersList] = useState<any[]>([])

   const getUsers = async () => {
      setLoading(true)
      try {
         const { data, error } = await supabase.from('view_users_from_game').select('*').eq('game_id', id)
         console.log('data', data)
         if (error) throw error
         data.length && setUsersList(data)
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

   return (
      <Drawer
         closable
         destroyOnClose
         title={<p>Список игроков</p>}
         placement="right"
         open
         loading={loading}
         onClose={() => handleChangeVisibleModal(false, 0)}
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
                  extra={<Button>Написать</Button>}
               >
                  <List.Item.Meta
                     avatar={
                        <Avatar src={item.avatar_url} style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
                     }
                     title={item.user_name}
                     description="Описание"
                  />
               </List.Item>
            )}
         />
         {/* {usersList.length ? usersList.map((item) => <div key={item.id}>{item.user_name}</div>) : null} */}
      </Drawer>
   )
}

export default ModalUsersInfo
