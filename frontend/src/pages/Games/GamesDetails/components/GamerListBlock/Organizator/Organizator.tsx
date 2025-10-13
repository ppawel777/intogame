import { Avatar, Collapse, Flex, Space } from 'antd'
import { PhoneOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { supabase } from '@supabaseDir/supabaseClient'
import { get_avatar_url } from '@utils/storage'
import { getRandomColor } from '@utils/colors'
import TelegramIcon from '@svg/telegram.svg'
import WhatsAppIcon from '@svg/whatsapp.svg'
import { useIsMobile } from '@utils/hooks/useIsMobile'

import s from './Organizator.module.scss'

type Player = {
   id: number
   user_name: string
   avatar_url?: string
   status_payment: string
   first_name?: string
   last_name?: string
}

type Props = {
   gameId?: number
   creator_id?: number | null
}

export const Organizator = ({ gameId, creator_id }: Props) => {
   const [creator, setCreator] = useState<Player | null>(null)
   const [avatarUrls, setAvatarUrls] = useState<Record<string, string>>({})
   const isMobile = useIsMobile()

   useEffect(() => {
      const loadCreator = async () => {
         if (!gameId || !creator_id) return

         try {
            const { data, error } = await supabase
               .from('view_users_from_game')
               .select('id, user_name, avatar_url, status_payment, first_name, last_name')
               .eq('game_id', gameId)
               .eq('id', creator_id)
               .single()

            if (error) throw error
            setCreator(data)

            if (data?.avatar_url) {
               const url = await get_avatar_url(data.avatar_url)
               if (url) {
                  setAvatarUrls({ [data.avatar_url]: url })
               }
            }
         } catch (error) {
            console.error('Ошибка загрузки организатора:', error)
         }
      }

      loadCreator()
   }, [gameId, creator_id])

   const getInitials = (name: string) => {
      return name.charAt(0).toUpperCase()
   }

   if (!creator) return null

   return (
      <Collapse
         defaultActiveKey={[]}
         style={{ marginTop: '16px' }}
         className={s.playerCollapse}
         ghost
         items={[
            {
               key: '1',
               label: 'Организатор игры',
               children: (
                  <Flex justify="space-between">
                     <Space>
                        <Avatar
                           src={avatarUrls[creator.avatar_url || '']}
                           size={isMobile ? 40 : 50}
                           style={{
                              backgroundColor: avatarUrls[creator.avatar_url || '']
                                 ? creator.status_payment === 'confirmed'
                                    ? '#52c41a'
                                    : '#faad14'
                                 : getRandomColor(creator.user_name),
                           }}
                        >
                           {!avatarUrls[creator.avatar_url || ''] && getInitials(creator.user_name)}
                        </Avatar>
                        <span>
                           {creator.user_name}
                           {creator.first_name && creator.last_name && ` (${creator.first_name} ${creator.last_name})`}
                        </span>
                     </Space>
                     <Space>
                        <img
                           src={TelegramIcon}
                           alt="Telegram"
                           style={{ width: '26px', height: '26px', cursor: 'pointer' }}
                        />
                        <img
                           src={WhatsAppIcon}
                           alt="WhatsApp"
                           style={{ width: '26px', height: '26px', cursor: 'pointer' }}
                        />
                        <PhoneOutlined style={{ fontSize: '23px', cursor: 'pointer' }} />
                     </Space>
                  </Flex>
               ),
            },
         ]}
      />
   )
}
