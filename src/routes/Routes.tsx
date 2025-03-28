import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Spin } from 'antd'

import PrivateRoute from './PrivateRoute'
import MainLayout from '../layouts/MainLayout'
import LoginRoute from './LoginRoute'
import GamesRoutes from './GameRoutes'

const Login = lazy(() => import('../pages/Login'))
const Home = lazy(() => import('../pages/Home'))
const Places = lazy(() => import('../pages/Places'))
const Place = lazy(() => import('../pages/Places/Place'))
const Profile = lazy(() => import('../pages/Profile'))
const Help = lazy(() => import('../pages/Help'))
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
               <Route path="/places/" element={<Places />} />
               <Route path="/places/:initId/" element={<Place />} />
               <Route path="/profile/" element={<Profile />} />
               <Route path="/help/" element={<Help />} />
               <Route path="/games/*" element={<GamesRoutes />} />
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
