import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@supabaseDir/supabaseClient'
import { checkAvailableCookies, deleteAuth } from '@utils/auth'

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
   const location = useLocation()
   const [isChecking, setIsChecking] = useState(true)
   const [isAuthenticated, setIsAuthenticated] = useState(false)

   useEffect(() => {
      const validateAuth = async () => {
         if (!checkAvailableCookies()) {
            setIsAuthenticated(false)
            setIsChecking(false)
            return
         }

         // Проверяем сессию Supabase
         try {
            const {
               data: { session },
               error,
            } = await supabase.auth.getSession()
            if (error) throw error

            // Дополнительно: проверяем, есть ли user.id
            if (session?.user?.id) {
               setIsAuthenticated(true)
            } else {
               setIsAuthenticated(false)
               deleteAuth()
            }
         } catch (error) {
            console.error('Ошибка проверки сессии:', error)
            setIsAuthenticated(false)
            deleteAuth()
         } finally {
            setIsChecking(false)
         }
      }

      validateAuth()
   }, [])

   if (isChecking) {
      return <div style={{ padding: '50px', textAlign: 'center' }}>Проверка авторизации...</div>
   }

   if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location.pathname }} replace />
   }

   return children
}

export default PrivateRoute
