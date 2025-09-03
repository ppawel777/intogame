/* eslint-disable @typescript-eslint/no-unused-vars */
import { memo, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flex, Menu, MenuProps } from 'antd'
// import { CarryOutOutlined, NumberOutlined, PlayCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons'

import AvatarProfile from './AvatarProfile'

import s from './NaviateTop.module.scss'

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
