import { supabase } from '@supabaseDir/supabaseClient'
import { useEffect } from 'react'

export const useOnAuthStateChange = (onAuthChange: (session: any) => void) => {
   useEffect(() => {
      const { data } = supabase.auth.onAuthStateChange((_, session) => {
         onAuthChange(session)
      })

      return () => {
         data.subscription.unsubscribe()
      }
   }, [])
}

export const useSignInWithPassword = async (email: string, password: string) => {
   const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
   })
   return { data, error }
}

export const useSignUp = async (email: string, password: string, user_name: string, phone: string) => {
   const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
         data: {
            user_name: user_name,
            user_phone: phone,
         },
      },
   })
   return { data, error }
}
