import React, { createContext, useContext, useState } from 'react'
import { checkAvailableCookies, deleteAuth, set_cookie } from '@utils/auth'
import { IUserData, SessionAuth } from '@typesDir/userTypes'

import { useUserQuery } from '@hooks/users/useUserQuery'
// import { getSession } from '@api/auth'
// import { useOnAuthStateChange } from '@hooks/auth/useSupabaseAuth'

interface AuthContextProps {
   userData: IUserData | null
   isAuthenticated: boolean
   signin: (arg0: SessionAuth, callback: () => void) => void
   signout: (callback: () => void) => void
}

const AuthContext = createContext<AuthContextProps>({
   userData: null,
   isAuthenticated: false,
   signin: () => {},
   signout: () => {},
})

interface AuthProviderProps {
   children: React.ReactNode
}

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: AuthProviderProps) => {
   const [isAuthenticated, setIsAuthenticated] = useState<boolean>(checkAvailableCookies)
   const { userData, isLoading, refetch } = useUserQuery(isAuthenticated)
   // const [initialLoading, setInitialLoading] = useState(true)

   // Проверяем сессию при монтировании
   // useEffect(() => {
   //    const checkSession = async () => {
   //       const data = await getSession()
   //       setIsAuthenticated(!!data.session)
   //       if (data.session) {
   //          refetch()
   //       }
   //       setInitialLoading(false)
   //    }

   //    checkSession()

   //    // Подписываемся на изменения сессии
   //    useOnAuthStateChange((session) => {
   //       const isAuthenticated = !!session
   //       setIsAuthenticated(isAuthenticated)
   //       if (isAuthenticated) {
   //          refetch()
   //       }
   //    })
   // }, [])

   const signin = (session: SessionAuth, callback: () => void) => {
      const { access_token, refresh_token, user_id } = session

      set_cookie({ name: 'access_token', value: access_token })
      set_cookie({ name: 'refresh_token', value: refresh_token })
      set_cookie({ name: 'user_id', value: user_id })

      setIsAuthenticated(true)
      refetch()
      callback()
   }

   const signout = (callback: () => void) => {
      setIsAuthenticated(false)
      deleteAuth()
      callback()
   }

   // Если пользователь авторизован, но запрос не выполнен показываем загрузку
   if (isAuthenticated && isLoading) {
      return <div style={{ textAlign: 'center', marginTop: '40vh' }}>Загружаем профиль...</div>
   }

   const value = {
      userData,
      isAuthenticated,
      signin,
      signout,
   }

   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
