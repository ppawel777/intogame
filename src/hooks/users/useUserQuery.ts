import { fetchUser } from '@api/auth'
import { useCustomQuery } from '@hooks/useCustomQuery'
import { supabase } from '@supabaseDir/supabaseClient'

export const useUserQuery = (enabled: boolean) => {
   const {
      data: userData = null,
      isLoading,
      refetch,
   } = useCustomQuery({
      queryKey: ['user'],
      queryFn: fetchUser,
      enabled,
   })

   return { userData, isLoading, refetch }
}

export const useInsertUser = async (uuid: any, email: string, user_name: string, phone: string) => {
   const { error } = await supabase.from('users').insert({
      uuid,
      email,
      user_name: user_name,
      user_phone: phone,
   })
   return { error }
}

export const useSelectUserFromGames = async (game_id: number) => {
   const { data, error } = await supabase.from('view_users_from_game').select('*').eq('game_id', game_id)
   return { data, error }
}
