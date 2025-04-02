import { Flex, Menu, MenuProps } from 'antd'
import { memo, useEffect, useState } from 'react'

import { CarryOutOutlined, NumberOutlined, PlayCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons'
// import { Link } from 'react-router-dom'
import AvatarProfile from './AvatarProfile'

import s from './index.module.scss'
import { useNavigate } from 'react-router-dom'

type MenuItem = Required<MenuProps>['items'][number]

const items: MenuItem[] = [
   {
      // label: <Link to={'places'}>Площадки</Link>,
      label: 'Площадки',
      key: 'places',
      icon: <NumberOutlined />,
   },
   {
      // label: <Link to={'games/reserved'}>В игру</Link>,
      label: 'В игру',
      key: 'games/reserved',
      icon: <PlayCircleOutlined />,
   },
   {
      // label: <Link to={'games/archive'}>Архив игр</Link>,
      label: 'Архив игр',
      key: 'games/archive',
      icon: <CarryOutOutlined />,
   },
   {
      // label: <Link to={'help'}>Помощь</Link>,
      label: 'Помощь',
      key: 'help',
      icon: <QuestionCircleOutlined />,
   },
]

const NaviateTop = () => {
   const navigate = useNavigate()
   const [current, setCurrent] = useState('games/reserved')

   useEffect(() => {
      navigate(current)
   }, [current])

   const onClick: MenuProps['onClick'] = (e) => setCurrent(e.key)

   return (
      <Flex justify="space-between" className={s.wrapNavigateTop} align="center">
         <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} className={s.menu} />
         <AvatarProfile />
      </Flex>
   )
}

export default memo(NaviateTop)
