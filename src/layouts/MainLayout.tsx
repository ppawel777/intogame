import { Layout } from 'antd'
import { Outlet, useLocation } from 'react-router-dom'
import ErrorBoundary from './ErrorBoundary'
import HeaderComponent from './components/Header'
// import Sidebar from './components/Sidebar'

const { Content } = Layout

const MainLayout = () => {
   const location = useLocation()

   return (
      <Layout className="wrap-container">
         {/* <Sidebar /> */}
         <Layout>
            {location.pathname !== '/' && <HeaderComponent />}
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
