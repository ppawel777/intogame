import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import ErrorBoundary from './ErrorBoundary'
import NaviateTop from './components/NaviateTop/NaviateTop'
// import Sidebar from './components/Sidebar'

import './main.scss'

const { Content, Footer } = Layout

const MainLayout = () => {
   // const location = useLocation()

   return (
      <Layout className="wrap-container">
         {/* {location.pathname !== '/' && <HeaderComponent />} */}
         <NaviateTop />
         <Content className="wrap-main">
            <ErrorBoundary>
               <Outlet />
            </ErrorBoundary>
         </Content>
         <Footer className="wrap-footer">
            <div>© 2025 В игру. Все права защищены.</div>
            {/* <div>ИНН 027003391848, ОГРНИП 317028000139848</div> */}
         </Footer>
      </Layout>
   )
}

export default MainLayout
