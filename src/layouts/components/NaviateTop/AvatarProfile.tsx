import { Avatar, Dropdown, MenuProps, message } from 'antd'
import { LoadingOutlined, UserOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@context/providers/AuthProvider/AuthProvider'
import { delete_cookie, get_cookie } from '@utils/auth'
import { useEffect, useState } from 'react'
import { supabase } from '@supabaseDir/supabaseClient'

import s from './NaviateTop.module.scss'

type User = {
   id: number
   user_name: string
}
const AvatarProfile = () => {
   const { signout } = useAuth()
   const navigate = useNavigate()

   const [user, setUser] = useState<User>({ user_name: '', id: 0 })
   const [loading, setLoading] = useState(false)

   const user_id = get_cookie('user_id')

   const getUser = async () => {
      setLoading(true)
      try {
         const { data, error } = await supabase.from('users').select('*').eq('uuid', user_id).single()
         if (error) throw error
         setUser({ user_name: data.user_name, id: data.id })
      } catch (error: any) {
         message.error(error.message)
      } finally {
         setLoading(false)
      }
   }

   useEffect(() => {
      user.id === 0 && getUser()
   }, [user_id])

   const handleSignOut = () => {
      signout(() => {
         sessionStorage.clear()
         localStorage.clear()

         delete_cookie('access_token')
         delete_cookie('refresh_token')
         delete_cookie('user_id')
         navigate('/login', { replace: true })
      })
   }

   const viewNameFunction = () => {
      const textName = user.user_name.length > 20 ? user.user_name.slice(0, 20) + '...' : user.user_name
      return !user.user_name ? 'Без имени' : textName
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
            <Link to={'profile'} state={{ id: user.id }}>
               Профиль
            </Link>
         ),
      },
      {
         key: '3',
         label: <span onClick={() => handleSignOut()}>Выход</span>,
      },
   ]

   return (
      <Dropdown menu={{ items }} trigger={['click']}>
         <Avatar size="large" icon={loading ? <LoadingOutlined /> : <UserOutlined />} className={s.avatar} />
      </Dropdown>
   )
}

export default AvatarProfile
