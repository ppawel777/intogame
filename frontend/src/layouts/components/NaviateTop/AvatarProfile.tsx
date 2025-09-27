import { Avatar, Dropdown, MenuProps, message } from 'antd'
import { LoadingOutlined, UserOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@context/providers/AuthProvider/AuthProvider'
import { delete_cookie } from '@utils/auth'
import { useEffect, useState } from 'react'
import { supabase } from '@supabaseDir/supabaseClient'

import s from './NaviateTop.module.scss'

type User = {
   id: number // внутренний ID из таблицы users
   user_name: string
}

const AvatarProfile = () => {
   const { signout } = useAuth()
   const navigate = useNavigate()

   const [user, setUser] = useState<User | null>(null)
   const [loading, setLoading] = useState(true) // стартуем с loading = true

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
               .select('id, user_name')
               .eq('uuid', authUserId)
               .single()

            if (userError) throw userError

            const name = userData.user_name?.trim() ? userData.user_name.trim() : 'Без имени'

            setUser({ id: userData.id, user_name: name })
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

   return (
      <Dropdown menu={{ items }} trigger={['click']} disabled={loading}>
         <Avatar size="large" className={s.avatar} alt={user?.user_name || 'Пользователь'}>
            {loading ? <LoadingOutlined /> : user?.user_name ? user.user_name[0].toUpperCase() : <UserOutlined />}
         </Avatar>
      </Dropdown>
   )
}

export default AvatarProfile
