import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Spin } from 'antd'

import PrivateRoute from './PrivateRoute'
import MainLayout from '../layouts/MainLayout'
import LoginRoute from './LoginRoute'
import GamesRoutes from './GameRoutes'

const LoginPage = lazy(() => import('../pages/Login/LoginPage'))
const HomePage = lazy(() => import('../pages/Home/HomePage'))
const PlacesPage = lazy(() => import('../pages/Places/PlacesPage'))
const PlacePage = lazy(() => import('../pages/Places/Place/PlacePage'))
const ProfilePage = lazy(() => import('../pages/Profile/ProfilePage'))
const HelpPage = lazy(() => import('../pages/Help/HelpPage'))
const ServiceInfoPage = lazy(() => import('../pages/ServiceInfo/ServiceInfoPage'))
const ContactsPage = lazy(() => import('../pages/Contacts/ContactsPage'))
const DocumentsPage = lazy(() => import('../pages/Documents/DocumentsPage'))
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
               <Route path="/places/" element={<PlacesPage />} />
               <Route path="/places/:initId/" element={<PlacePage />} />
               <Route path="/profile/" element={<ProfilePage />} />
               <Route path="/help/" element={<HelpPage />} />
               <Route path="/service-info/" element={<ServiceInfoPage />} />
               <Route path="/contacts/" element={<ContactsPage />} />
               <Route path="/documents/" element={<DocumentsPage />} />
               <Route path="/games/*" element={<GamesRoutes />} />
               <Route path="/" element={<HomePage />} />
               <Route path="*" element={<_404 />} />
            </Route>
            <Route
               element={
                  <LoginRoute>
                     <LoginPage />
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
