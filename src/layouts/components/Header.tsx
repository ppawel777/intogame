import { Layout } from 'antd'
import { memo } from 'react'

import './index.scss'

const { Header } = Layout

const HeaderComponent = () => {
   return (
      <Header className="wrap-header">
         <h1 className="wrap-header__title">h1</h1>
      </Header>
   )
}

export default memo(HeaderComponent)
