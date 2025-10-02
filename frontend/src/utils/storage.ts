import { supabase } from '@supabaseDir/supabaseClient'

const BUCKET_NAME = 'profile_photo_users'

export const upload_avatar = async (file: File, userId: string): Promise<string | null> => {
   const fileExt = file.name.split('.').pop()
   const fileName = `${userId}.${fileExt}`
   const filePath = fileName

   // Получаем текущий avatar_url
   const { data: userData } = await supabase.from('users').select('avatar_url').eq('uuid', userId).single()
   const oldAvatarPath = userData?.avatar_url

   // Удаляем старый, если есть
   if (oldAvatarPath) {
      await supabase.storage.from(BUCKET_NAME).remove([oldAvatarPath])
   }

   // Загружаем новый
   const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, { upsert: true })

   if (uploadError) throw uploadError

   return filePath
}

export const get_avatar_url = (fileName: string | null): string | null => {
   if (!fileName) return null

   const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName)
   return data.publicUrl
}
