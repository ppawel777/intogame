import { Avatar, Button, Drawer, Input, List, Space, Spin, message as antMessage } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { SendOutlined } from '@ant-design/icons'
import {
   type GameChatMessage,
   fetchGameChatMessages,
   sendGameChatMessage,
   subscribeToGameChat,
   unsubscribeFromGameChat,
} from '@api/gameChat'
import { get_avatar_url } from '@utils/storage'
import { getRandomColor } from '@utils/colors'
import { useIsMobile } from '@utils/hooks/useIsMobile'

import s from './DrawerChat.module.scss'

const { TextArea } = Input

type Props = {
   open: boolean
   onClose: () => void
   gameId: number
}

export const DrawerChat = ({ open, onClose, gameId }: Props) => {
   const [messages, setMessages] = useState<GameChatMessage[]>([])
   const [loading, setLoading] = useState(false)
   const [sending, setSending] = useState(false)
   const [messageText, setMessageText] = useState('')
   const [avatarUrls, setAvatarUrls] = useState<Record<string, string>>({})
   const messagesEndRef = useRef<HTMLDivElement>(null)
   const isMobile = useIsMobile()

   // Загрузка сообщений при открытии
   useEffect(() => {
      if (open) {
         loadMessages()
      }
   }, [open, gameId])

   // Подписка на новые сообщения (realtime)
   useEffect(() => {
      if (!open) return

      const subscription = subscribeToGameChat(gameId, (newMessage) => {
         setMessages((prev) => {
            // Проверяем, нет ли уже такого сообщения
            if (prev.some((msg) => msg.id === newMessage.id)) {
               return prev
            }
            return [...prev, newMessage]
         })
      })

      return () => {
         unsubscribeFromGameChat(subscription)
      }
   }, [open, gameId])

   // Загрузка аватаров
   useEffect(() => {
      messages.forEach(async (msg) => {
         if (msg.avatar_url && !avatarUrls[msg.avatar_url]) {
            const url = await get_avatar_url(msg.avatar_url)
            if (url) {
               setAvatarUrls((prev) => ({ ...prev, [msg.avatar_url!]: url }))
            }
         }
      })
   }, [messages])

   // Автоскролл вниз при новых сообщениях
   useEffect(() => {
      scrollToBottom()
   }, [messages])

   const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
   }

   const loadMessages = async () => {
      setLoading(true)
      try {
         const data = await fetchGameChatMessages(gameId)
         setMessages(data)
      } catch (error) {
         console.error('Ошибка загрузки сообщений:', error)
         antMessage.error('Не удалось загрузить сообщения')
      } finally {
         setLoading(false)
      }
   }

   const handleSendMessage = async () => {
      if (!messageText.trim()) return

      setSending(true)
      try {
         await sendGameChatMessage(gameId, messageText)
         setMessageText('')
         // Перезагружаем сообщения после отправки
         await loadMessages()
      } catch (error) {
         console.error('Ошибка отправки сообщения:', error)
         antMessage.error('Не удалось отправить сообщение')
      } finally {
         setSending(false)
      }
   }

   const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
         e.preventDefault()
         handleSendMessage()
      }
   }

   const formatTime = (dateString: string) => {
      const date = new Date(dateString)
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
   }

   const getInitials = (name: string) => {
      return name.charAt(0).toUpperCase()
   }

   return (
      <Drawer
         title="Чат с игроками"
         placement="right"
         onClose={onClose}
         open={open}
         width={isMobile ? '100%' : 600}
         maskClosable={false}
         className={s.drawerChat}
      >
         <div className={s.chatContainer}>
            {/* Область сообщений */}
            <div className={s.messagesArea}>
               {loading ? (
                  <div className={s.loadingContainer}>
                     <Spin size="large" />
                  </div>
               ) : (
                  <List
                     dataSource={messages}
                     renderItem={(msg) => (
                        <List.Item key={msg.id} className={s.messageItem}>
                           <List.Item.Meta
                              avatar={
                                 <Avatar
                                    size={32}
                                    src={avatarUrls[msg.avatar_url || '']}
                                    style={{
                                       backgroundColor: avatarUrls[msg.avatar_url || '']
                                          ? undefined
                                          : getRandomColor(msg.user_name),
                                    }}
                                 >
                                    {!avatarUrls[msg.avatar_url || ''] && getInitials(msg.user_name)}
                                 </Avatar>
                              }
                              title={
                                 <Space className={s.messageHeader}>
                                    <span className={msg.is_creator ? s.creatorName : s.userName}>{msg.user_name}</span>
                                    <span className={s.messageTime}>{formatTime(msg.created_at)}</span>
                                 </Space>
                              }
                              description={<div className={s.messageText}>{msg.message}</div>}
                           />
                        </List.Item>
                     )}
                  />
               )}
               <div ref={messagesEndRef} />
            </div>

            {/* Поле ввода */}
            <div className={s.inputArea}>
               <TextArea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Введите сообщение..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  maxLength={500}
                  disabled={sending}
               />
               <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  loading={sending}
                  disabled={!messageText.trim()}
                  className={s.sendButton}
               >
                  {!isMobile && 'Отправить'}
               </Button>
            </div>
         </div>
      </Drawer>
   )
}
