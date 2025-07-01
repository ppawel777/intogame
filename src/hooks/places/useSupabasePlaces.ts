import { supabase } from '@supabaseDir/supabaseClient'

export const useSelectAllPlaces = async () => {
   const { data, error } = await supabase.from('places').select('*').eq('is_active', true)
   return { data, error }
}
