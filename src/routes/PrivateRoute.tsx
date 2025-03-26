import { checkAvailableCookies } from '@utils/auth'
import { Navigate, useLocation } from 'react-router-dom'

const PrivateRoute = ({ children }: any) => {
   const location = useLocation()

   const isJWTCookiesAuth = checkAvailableCookies()

   if (!isJWTCookiesAuth) {
      return <Navigate to="/login" state={{ from: location.pathname }} replace />
   }
   return children
}

export default PrivateRoute
