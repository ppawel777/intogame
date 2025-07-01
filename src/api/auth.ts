import { supabase } from '@supabaseDir/supabaseClient'
import { IUserData } from '@typesDir/userTypes'
import { checkAvailableCookies, get_cookie } from '@utils/auth'

export const fetchUser = async (): Promise<IUserData | null> => {
   const authStatus = checkAvailableCookies()
   if (!authStatus) return null
   const userUUID = get_cookie('user_id')
   if (!userUUID) throw new Error('User UUID not found in cookies')

   // const { data: authData, error: authError } = await supabase.auth.getUser()
   // if (authError || !authData?.user) return null
   // const { data, error } = await supabase.from('users').select('*').eq('uuid', authData.user.id).single()

   const { data, error } = await supabase.from('users').select('*').eq('uuid', userUUID).single()

   if (error) throw error

   return data
}

export const getSession = async () => {
   const { data, error } = await supabase.auth.getSession()
   if (error) throw error

   return data
}
