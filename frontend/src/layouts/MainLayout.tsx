import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import { ReactNode } from 'react'
import ErrorBoundary from './ErrorBoundary'
import NaviateTop from './components/NaviateTop/NaviateTop'
// import Sidebar from './components/Sidebar'

import './main.scss'

const { Content, Footer } = Layout

interface MainLayoutProps {
   children?: ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
   // const location = useLocation()

   return (
      <Layout className="wrap-container">
         {/* {location.pathname !== '/' && <HeaderComponent />} */}
         <NaviateTop />
         <Content className="wrap-main">
            <ErrorBoundary>{children || <Outlet />}</ErrorBoundary>
         </Content>
         <Footer className="wrap-footer">
            <div>© 2026 В игру. Все права защищены.</div>
            {/* <div>ИНН 027003391848, ОГРНИП 317028000139848</div> */}
         </Footer>
      </Layout>
   )
}

export default MainLayout
