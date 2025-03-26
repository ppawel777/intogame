import { useMemo } from 'react'
import { Menu, Switch } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'

import UserProfile from '../UserProfile'
import { useAuth } from '@context/providers/AuthProvider/AuthProvider'
import { useAppDispatch, useAppSelector } from '@hooks/hooks'
import { delete_cookie } from '@utils/auth'
import { sendLogoutRequest } from '@store/userProfile/actions'
import { userProfileActions } from '@store/userProfile/userProfileSlice'
import { classNames } from '@utils/classNames'
import { useTheme } from '@context/providers/ThemeProvider'

import type { MenuProps } from 'antd/lib'
import type { Mods } from '@utils/classNames'

import s from './ProfileMenu.module.scss'

export const ProfileMenu = () => {
   const dispatch = useAppDispatch()

   const { isDarkTheme, toggleTheme } = useTheme()

   const provider_list = useAppSelector(({ userProfile }) => userProfile.provider_list)
   const sudir_auth_list = useAppSelector(({ userProfile }) => userProfile.sudir_auth_list)

   const { userData, signout } = useAuth()
   const navigate = useNavigate()

   const onLogOut: MenuProps['onClick'] = () => {
      signout(() => {
         // Очищаем Session/Locale Storage при выходе из системы >>
         sessionStorage.clear()
         localStorage.clear()
         // <<
         if (provider_list.length > 0) {
            if (provider_list[0] === 'sudir') {
               sudir_auth_list.forEach((item: { id: any; logout_url: string }) => {
                  if (item.id === provider_list[1]) {
                     document.location.href = item.logout_url
                     delete_cookie('provider')
                  }
               })
            }
         } else {
            sendLogoutRequest().then((status: number) => {
               if (status === 200) {
                  dispatch(userProfileActions.setIsJWTTokenCookies(false))
                  delete_cookie('access_token')
                  delete_cookie('refresh_token')
                  navigate('/login', { replace: true })
               }
            })
         }
      })
   }

   const calculateWidth = (userName: any) => {
      let width = 12
      if (userName) {
         const length = userName.length
         if (length >= 5 && length <= 15) width = 12
         if (length > 15 && length <= 20) width = 18
         if (length > 20 && length <= 30) width = 20
         if (length > 30 && length <= 40) width = 26
         if (length > 40 && length <= 50) width = 29
         if (length > 50) width = 35
      }

      return width
   }

   const conditionalClassNames: Mods = {
      [s.pseudoMenuItem__darkMode]: isDarkTheme,
   }

   const items = useMemo(() => {
      const userName = userData?.username || null

      const width = calculateWidth(userName)

      const userAlias = userName && userName.substr(0, 1).toUpperCase()

      const result: MenuProps['items'] = [
         {
            key: 'root-profile',
            label: 'Профиль пользователя',
            icon: <UserOutlined />,
            children: [
               {
                  key: 'user-info',
                  label: <UserProfile current_user={userName} userAlias={userAlias} />,
                  disabled: true,
                  style: { maxWidth: '35rem', width: `${width}rem` },
               },
               {
                  key: 'profile',
                  label: <Link to="/user-profile">Профиль</Link>,
               },
               {
                  key: 'dark-theme-switcher',
                  label: 'Ночной режим',
                  extra: <Switch checked={isDarkTheme} onChange={toggleTheme} />,
                  className: s.pseudoMenuItem,
               },
               {
                  key: 'logout',
                  label: 'Выход',
                  onClick: onLogOut,
               },
            ],
         },
      ]
      return result
   }, [JSON.stringify(userData), isDarkTheme])

   return <Menu mode="inline" className={classNames('wrap-sidebar__menu-items', conditionalClassNames)} items={items} />
}
