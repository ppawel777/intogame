import { checkAvailableCookies } from '@utils/auth'
import { Navigate } from 'react-router-dom'

const LoginRoute = ({ children }: any) => {
   const isJWTCookiesAuth = checkAvailableCookies()
   if (isJWTCookiesAuth) {
      return <Navigate to="/" replace />
   }

   return children
}

export default LoginRoute
