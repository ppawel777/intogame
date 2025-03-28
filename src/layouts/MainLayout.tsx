import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import ErrorBoundary from './ErrorBoundary'
import NaviateTop from './components/NaviateTop/NaviateTop'
// import Sidebar from './components/Sidebar'

import './main.scss'

const { Content } = Layout

const MainLayout = () => {
   // const location = useLocation()

   return (
      <Layout className="wrap-container">
         {/* <Sidebar /> */}
         <Layout>
            {/* {location.pathname !== '/' && <HeaderComponent />} */}
            <NaviateTop />
            <Content className="wrap-main">
               <ErrorBoundary>
                  <Outlet />
               </ErrorBoundary>
            </Content>
         </Layout>
      </Layout>
   )
}

export default MainLayout
