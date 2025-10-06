import { useEffect, useState } from 'react'
import { supabase } from '@supabaseDir/supabaseClient'
import { message } from 'antd'

export const useUserId = () => {
   const [userId, setUserId] = useState<number | null>(null)
   const [isManager, setIsManager] = useState(false)
   const [loading, setLoading] = useState(true)

   useEffect(() => {
      const loadUser = async () => {
         setLoading(true)
         try {
            const {
               data: { session },
               error: authError,
            } = await supabase.auth.getSession()
            if (authError) throw authError
            if (!session) throw new Error('Пользователь не авторизован')

            const { data: userData, error: userError } = await supabase
               .from('users')
               .select('id, is_manager')
               .eq('uuid', session.user.id)
               .single()

            if (userError) throw userError
            setUserId(userData.id)
            setIsManager(!!userData.is_manager)
         } catch (error: any) {
            message.error('Ошибка авторизации: ' + error.message)
         } finally {
            setLoading(false)
         }
      }

      loadUser()
   }, [])

   return { userId, isManager, loading }
}
