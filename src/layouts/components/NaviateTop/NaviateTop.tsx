import { Flex, Menu, MenuProps } from 'antd'
import { memo, useState } from 'react'

import { CarryOutOutlined, NumberOutlined, PlayCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'

import s from './index.module.scss'
import AvatarProfile from './AvatarProfile'

type MenuItem = Required<MenuProps>['items'][number]

const items: MenuItem[] = [
   {
      label: <Link to={'places'}>Площадки</Link>,
      key: 'places',
      icon: <NumberOutlined />,
   },
   // {
   //    label: 'Мои игры',
   //    key: 'subMenu',
   //    icon: <PlayCircleOutlined />,
   //    children: [
   //       { label: <Link to={'games/reserved'}>Записаться</Link>, key: 'reserved_game', icon: <EditOutlined /> },
   //       { label: <Link to={'games/archive'}>Архив игр</Link>, key: 'archive_games', icon: <CarryOutOutlined /> },
   //    ],
   // },
   {
      label: <Link to={'games/reserved'}>В игру</Link>,
      key: 'reserved_game',
      icon: <PlayCircleOutlined />,
   },
   {
      label: <Link to={'games/archive'}>Архив игр</Link>,
      key: 'archive_games',
      icon: <CarryOutOutlined />,
   },
   // {
   //    label: <Link to={'profile'}>Мой профиль</Link>,
   //    key: 'profile',
   //    icon: <UserOutlined />,
   // },
   {
      label: <Link to={'help'}>Помощь</Link>,
      key: 'help',
      icon: <QuestionCircleOutlined />,
   },
]

const NaviateTop = () => {
   const [current, setCurrent] = useState('places')

   const onClick: MenuProps['onClick'] = (e) => setCurrent(e.key)

   return (
      <Flex justify="space-between" className={s.wrapNavigateTop} align="center">
         <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} className={s.menu} />
         <AvatarProfile />
      </Flex>
   )
}

export default memo(NaviateTop)
