import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Spin } from 'antd'

import PrivateRoute from './PrivateRoute'
import MainLayout from '../layouts/MainLayout'
import LoginRoute from './LoginRoute'

const Login = lazy(() => import('../pages/Login'))
const Home = lazy(() => import('../pages/Home'))
const _404 = lazy(() => import('../pages/Error/_404'))

const RoutesComponent = () => {
   return (
      <Suspense
         fallback={<Spin style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '40vh' }} />}
      >
         <Routes>
            <Route
               element={
                  <PrivateRoute>
                     <MainLayout />
                  </PrivateRoute>
               }
            >
               <Route path="/" element={<Home />} />
               <Route path="*" element={<_404 />} />
            </Route>
            <Route
               element={
                  <LoginRoute>
                     <Login />
                  </LoginRoute>
               }
            >
               <Route path="login" />
            </Route>
            <Route path="*" element={<_404 />} />
         </Routes>
      </Suspense>
   )
}

export default RoutesComponent
