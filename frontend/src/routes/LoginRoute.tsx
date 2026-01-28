import { checkAvailableCookies } from '@utils/auth'
import { Navigate } from 'react-router-dom'

const LoginRoute = ({ children }: any) => {
   const isJWTCookiesAuth = checkAvailableCookies()
   // Если пользователь авторизован, перенаправляем на главную (HomePage)
   // PrivateRoute обработает авторизованных пользователей и покажет HomePage
   if (isJWTCookiesAuth) {
      return <Navigate to="/" replace />
   }

   return children
}

export default LoginRoute

