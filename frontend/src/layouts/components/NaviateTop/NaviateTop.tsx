import { memo, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Drawer, Flex, Menu, MenuProps } from 'antd'
import { MenuOutlined } from '@ant-design/icons'

import AvatarProfile from './AvatarProfile'

import s from './NaviateTop.module.scss'
import { useIsMobile } from '@utils/hooks/useIsMobile'

type MenuItem = Required<MenuProps>['items'][number]

const items: MenuItem[] = [
   // {
   //    label: 'Главная',
   //    key: '/',
   //    // icon: <NumberOutlined />,
   // },
   {
      label: 'Игровые площадки',
      key: 'places',
      // icon: <NumberOutlined />,
   },
   {
      label: 'Календарь игр',
      key: 'calendar-games',
      // icon: <NumberOutlined />,
   },
   {
      label: 'Запись в игру',
      key: 'games/reserved',
      // icon: <PlayCircleOutlined />,
   },
   {
      label: 'Архив игр',
      key: 'games/archive',
      // icon: <CarryOutOutlined />,
   },
   {
      label: 'О сервисе',
      key: 'service-info',
      // icon: <QuestionCircleOutlined />,
   },
   {
      label: 'Правила и документы',
      key: 'documents',
      // icon: <QuestionCircleOutlined />,
   },
   {
      label: 'Контакты',
      key: 'contacts',
      // icon: <QuestionCircleOutlined />,
   },
   // {
   //    label: 'Помощь',
   //    key: 'help',
   //    // icon: <QuestionCircleOutlined />,
   // },
]

const NaviateTop = () => {
   const navigate = useNavigate()
   const location = useLocation()
   const [current, setCurrent] = useState('games/reserved')
   const [drawerVisible, setDrawerVisible] = useState(false)
   const isMobile = useIsMobile()

   const menuKeys = items.map((item) => item?.key as string)

   // Определяем активный ключ на основе текущего пути
   useEffect(() => {
      const path = location.pathname
      const normalizedPath = path.replace(/^\/|\/$/g, '')

      // Если путь корневой или пустой, редиректим на games/reserved
      if (normalizedPath === '' || normalizedPath === '/') {
         navigate('/games/reserved')
         setCurrent('games/reserved')
         return
      }

      // Ищем совпадение с ключами меню
      const matchedKey = menuKeys.find((key) => {
         const normalizedKey = key.replace(/^\/|\/$/g, '')
         return normalizedPath === normalizedKey
      })

      // Устанавливаем current, только если есть совпадение
      setCurrent(matchedKey || 'games/reserved')
   }, [location.pathname, navigate])

   const onClick: MenuProps['onClick'] = (e) => {
      const key = e.key
      setCurrent(key)
      navigate(`/${key}`)
      if (isMobile) {
         setDrawerVisible(false)
      }
   }

   const toggleDrawer = () => {
      setDrawerVisible(!drawerVisible)
   }

   const renderMenu = () => (
      <Menu
         onClick={onClick}
         selectedKeys={current ? [current] : []}
         mode={isMobile ? 'vertical' : 'horizontal'}
         items={items}
         className={s.menu}
      />
   )

   return (
      <Flex justify="space-between" className={s.wrapNavigateTop} align="center">
         {isMobile ? (
            <>
               <MenuOutlined className={s.burgerIcon} onClick={toggleDrawer} />
               <Drawer placement="left" onClose={toggleDrawer} open={drawerVisible} title="Меню" width={280}>
                  {renderMenu()}
               </Drawer>
            </>
         ) : (
            renderMenu()
         )}
         <AvatarProfile />
      </Flex>
   )
}

export default memo(NaviateTop)
