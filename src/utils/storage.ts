import { supabase } from '@supabaseDir/supabaseClient'

const BUCKET_NAME = 'avatars'

export const upload_avatar = async (file: File, userId: string): Promise<string | null> => {
   const fileExt = file.name.split('.').pop()
   const fileName = `${userId}.${fileExt}`
   const filePath = `${fileName}`

   const { error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, { upsert: true })

   if (error) throw error
   return filePath
}

export const get_avatar_url = (filePath: string): string => {
   const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)
   return data.publicUrl
}
