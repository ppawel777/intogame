import { supabase } from '@supabaseDir/supabaseClient'

export type GameChatMessage = {
   id: number
   game_id: number
   user_id: string
   message: string
   created_at: string
   user_name: string
   avatar_url?: string
   is_creator: boolean
}

/**
 * Получить все сообщения для игры
 */
export const fetchGameChatMessages = async (gameId: number): Promise<GameChatMessage[]> => {
   const { data, error } = await supabase
      .from('view_game_chat_messages')
      .select('*')
      .eq('game_id', gameId)
      .order('created_at', { ascending: true })

   if (error) {
      console.error('Ошибка загрузки сообщений чата:', error)
      throw error
   }

   return data || []
}

/**
 * Отправить сообщение в чат
 */
export const sendGameChatMessage = async (gameId: number, message: string): Promise<void> => {
   const {
      data: { user },
   } = await supabase.auth.getUser()

   if (!user) {
      throw new Error('Пользователь не авторизован')
   }

   const { error } = await supabase.from('game_chat_messages').insert({
      game_id: gameId,
      user_id: user.id,
      message: message.trim(),
   })

   if (error) {
      console.error('Ошибка отправки сообщения:', error)
      throw error
   }
}

/**
 * Подписка на новые сообщения в чате (realtime)
 */
export const subscribeToGameChat = (gameId: number, onNewMessage: (message: GameChatMessage) => void) => {
   // eslint-disable-next-line no-console
   console.log('[gameChat API] Creating realtime subscription for game:', gameId)

   const channel = supabase.channel(`game_chat_${gameId}`)

   // eslint-disable-next-line no-console
   console.log('[gameChat API] Channel created:', channel)

   channel.on(
      'postgres_changes',
      {
         event: 'INSERT',
         schema: 'public',
         table: 'game_chat_messages',
         filter: `game_id=eq.${gameId}`,
      },
      async (payload) => {
         // eslint-disable-next-line no-console
         console.log('[gameChat API] Realtime event received:', payload)

         // Получаем полную информацию о сообщении из view
         const { data } = await supabase.from('view_game_chat_messages').select('*').eq('id', payload.new.id).single()

         if (data) {
            onNewMessage(data as GameChatMessage)
         }
      },
   )

   // eslint-disable-next-line no-console
   console.log('[gameChat API] Event handler registered, subscribing...')

   channel.subscribe((status, err) => {
      // eslint-disable-next-line no-console
      console.log('[gameChat API] Subscription status changed:', status, 'error:', err)
   })

   return channel
}

/**
 * Отписаться от обновлений чата
 */
export const unsubscribeFromGameChat = async (subscription: ReturnType<typeof subscribeToGameChat>) => {
   await supabase.removeChannel(subscription)
}
