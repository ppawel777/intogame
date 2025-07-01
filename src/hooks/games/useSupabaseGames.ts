import { supabase } from '@supabaseDir/supabaseClient'

export const useSelectVotes = async (user_id: number) => {
   const { data, error } = await supabase.from('votes').select('*').eq('user_id', user_id)
   return { data, error }
}

export const useInsertVotes = async (values: any) => {
   const { error } = await supabase.from('votes').insert(values)
   return { error }
}

export const useDeleteVotes = async (game_id: number, user_id: number) => {
   const { error } = await supabase.from('votes').delete().eq('game_id', game_id).eq('user_id', user_id)
   return { error }
}

export const useSelectGames = async (isArchive: boolean) => {
   const { data, error } = await supabase.from('view_games').select('*').eq('is_active', !isArchive)
   return { data, error }
}

export const useInsertGame = async (values: any) => {
   const { data, error } = await supabase.from('games').insert([values]).select()
   return { data, error }
}

export const useUpdatedGame = async (values: any, id: number) => {
   const { data, error } = await supabase.from('games').update(values).eq('id', id).select()
   return { data, error }
}
