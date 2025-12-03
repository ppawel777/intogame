import { Avatar, Dropdown, MenuProps, Skeleton, message } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@context/providers/AuthProvider/AuthProvider'
import { delete_cookie } from '@utils/auth'
import { useEffect, useState } from 'react'
import { supabase } from '@supabaseDir/supabaseClient'
import { get_avatar_url } from '@utils/storage'

import s from './NaviateTop.module.scss'
import { getRandomColor } from '@utils/colors'

type User = {
   id: number // внутренний ID из таблицы users
   user_name: string
   avatar_url?: string
}

const AvatarProfile = () => {
   const { signout } = useAuth()
   const navigate = useNavigate()

   const [user, setUser] = useState<User | null>(null)
   const [loading, setLoading] = useState(true) // стартуем с loading = true
   const [avatarUrl, setAvatarUrl] = useState<string>('')
   const [avatarLoading, setAvatarLoading] = useState(false)

   useEffect(() => {
      const fetchUserProfile = async () => {
         try {
            // Получаем сессию и пользователя
            const {
               data: { session },
               error: authError,
            } = await supabase.auth.getSession()
            if (authError) throw authError
            if (!session) throw new Error('Пользователь не авторизован')

            const authUserId = session.user.id // UUID из auth.users

            const { data: userData, error: userError } = await supabase
               .from('users')
               .select('id, user_name, avatar_url')
               .eq('uuid', authUserId)
               .maybeSingle()

            if (userError) throw userError

            // Если записи ещё нет в users (новый пользователь с подтверждённым email)
            if (!userData) {
               setUser({ id: 0, user_name: 'Гость' })
               return
            }

            const name = userData.user_name?.trim() ? userData.user_name.trim() : 'Без имени'

            setUser({ id: userData.id, user_name: name, avatar_url: userData.avatar_url })
         } catch (error: any) {
            console.error('Ошибка загрузки профиля:', error)
            message.error('Не удалось загрузить профиль')
            setUser({ id: 0, user_name: 'Гость' })
         } finally {
            setLoading(false)
         }
      }

      fetchUserProfile()
   }, [])

   useEffect(() => {
      const loadAvatar = async () => {
         if (user?.avatar_url) {
            setAvatarLoading(true)
            try {
               const url = await get_avatar_url(user.avatar_url)
               if (url) {
                  setAvatarUrl(url)
               }
            } catch (error) {
               console.error('Ошибка загрузки аватара:', error)
            } finally {
               setAvatarLoading(false)
            }
         }
      }

      loadAvatar()
   }, [user?.avatar_url])

   const handleSignOut = () => {
      signout(() => {
         sessionStorage.clear()
         localStorage.clear()

         delete_cookie('access_token')
         delete_cookie('refresh_token')

         navigate('/login', { replace: true })
      })
   }

   const viewNameFunction = () => {
      if (loading) return 'Загрузка...'
      if (!user) return 'Без имени'
      return user.user_name.length > 20 ? user.user_name.slice(0, 20) + '...' : user.user_name
   }

   const getInitials = (name: string) => {
      return name.charAt(0).toUpperCase()
   }

   const items: MenuProps['items'] = [
      {
         key: '1',
         label: <span>{viewNameFunction()}</span>,
         disabled: true,
      },
      {
         type: 'divider',
      },
      {
         key: '2',
         label: (
            <Link to="/profile" state={{ id: user?.id }}>
               Профиль
            </Link>
         ),
         disabled: !user || loading,
      },
      {
         key: '3',
         label: <span onClick={handleSignOut}>Выход</span>,
      },
   ]

   if (loading) {
      return <Skeleton.Avatar size="large" className={s.avatar} active />
   }

   return (
      <Dropdown menu={{ items }} trigger={['click']} disabled={loading}>
         {avatarLoading ? (
            <Skeleton.Avatar size="large" className={s.avatar} active />
         ) : (
            <Avatar
               size="large"
               className={s.avatar}
               alt={user?.user_name || 'Пользователь'}
               src={avatarUrl}
               style={{
                  backgroundColor: !avatarUrl && user?.user_name ? getRandomColor(user.user_name) : undefined,
               }}
            >
               {!avatarUrl && user?.user_name ? getInitials(user.user_name) : !user?.user_name ? <UserOutlined /> : null}
            </Avatar>
         )}
      </Dropdown>
   )
}

export default AvatarProfile
