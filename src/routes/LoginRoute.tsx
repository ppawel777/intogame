import { Navigate } from 'react-router-dom'

const LoginRoute = ({ children }: any) => {
   const is_JWTToken_cookies = true
   if (is_JWTToken_cookies) {
      return <Navigate to="/" replace />
   }

   return children
}

export default LoginRoute
