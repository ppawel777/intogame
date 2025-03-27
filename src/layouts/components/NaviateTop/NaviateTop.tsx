import { Menu, MenuProps } from 'antd'
import { memo, useState } from 'react'

import {
   CarryOutOutlined,
   EditOutlined,
   NumberOutlined,
   PlayCircleOutlined,
   QuestionCircleOutlined,
   UserOutlined,
} from '@ant-design/icons'
import { Link } from 'react-router-dom'

type MenuItem = Required<MenuProps>['items'][number]

const items: MenuItem[] = [
   {
      label: <Link to={'places'}>Площадки</Link>,
      key: 'places',
      icon: <NumberOutlined />,
   },
   {
      label: 'Мои игры',
      key: 'subMenu',
      icon: <PlayCircleOutlined />,
      children: [
         { label: <Link to={'games/reserved'}>Записаться</Link>, key: 'reserved_game', icon: <EditOutlined /> },
         { label: <Link to={'games/archive'}>Архив игр</Link>, key: 'archive_games', icon: <CarryOutOutlined /> },
      ],
   },
   {
      label: <Link to={'profile'}>Мой профиль</Link>,
      key: 'profile',
      icon: <UserOutlined />,
   },
   {
      label: <Link to={'help'}>Помощь</Link>,
      key: 'help',
      icon: <QuestionCircleOutlined />,
   },
]

const NaviateTop = () => {
   const [current, setCurrent] = useState('places')

   const onClick: MenuProps['onClick'] = (e) => setCurrent(e.key)

   return <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />
}

export default memo(NaviateTop)
