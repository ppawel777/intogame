import React, { createContext, useContext } from 'react'

const AuthContext = createContext<AuthContextProps>({
   userData: null,
   signin: () => {},
   signout: () => {},
})

interface AuthProviderProps {
   children: React.ReactNode
}

export const useAuth = () => useContext(AuthContext)

interface IUserData {
   id?: any
   user_id?: any
   username?: any
   first_name?: any
   last_name?: any
   email?: any
   position?: any
   telephone?: any
}

interface AuthContextProps {
   userData: IUserData | null
   signout: (callback: () => void) => void
   signin: (callback: () => void) => void
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
   // const userData: IUserData = useAppSelector(({ userProfile }) => userProfile.current_user_obj)
   const userData = { id: 1, username: 'test' }

   const signin = (callback: () => void) => callback()
   const signout = (callback: () => void) => callback()

   const value = {
      userData,
      signin,
      signout,
   }
   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
