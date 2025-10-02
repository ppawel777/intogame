import { supabase } from '@supabaseDir/supabaseClient'

const BUCKET_NAME = 'profile_photo_users'

export const upload_avatar = async (file: File, userId: string): Promise<string | null> => {
   try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}.${fileExt}`
      const filePath = `${userId}/${fileName}` // Добавляем userId в путь для RLS

      // Получаем текущий avatar_url
      const { data: userData, error: userError } = await supabase
         .from('users')
         .select('avatar_url')
         .eq('uuid', userId)
         .single()

      if (userError) throw userError

      const oldAvatarPath = userData?.avatar_url

      // Удаляем старый, если есть
      if (oldAvatarPath) {
         const { error: removeError } = await supabase.storage.from(BUCKET_NAME).remove([oldAvatarPath])

         if (removeError) {
            console.error('Error removing old avatar:', removeError)
         }
      }

      // Загружаем новый
      const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, {
         upsert: true,
         cacheControl: '3600',
         contentType: file.type,
      })

      if (uploadError) throw uploadError

      return filePath
   } catch (error: any) {
      console.error('Error in upload_avatar:', error)
      throw error
   }
}

export const delete_avatar = async (userId: string): Promise<void> => {
   try {
      const { data: userData, error: userError } = await supabase
         .from('users')
         .select('avatar_url')
         .eq('uuid', userId)
         .single()

      if (userError) throw userError

      if (userData?.avatar_url) {
         const { error: removeError } = await supabase.storage.from(BUCKET_NAME).remove([userData.avatar_url])

         if (removeError) throw removeError

         await supabase.from('users').update({ avatar_url: null }).eq('uuid', userId)
      }
   } catch (error: any) {
      console.error('Error deleting avatar:', error)
      throw error
   }
}

export const get_avatar_url = async (fileName: string | null): Promise<string | null> => {
   if (!fileName) return null

   try {
      const { data, error } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(fileName, 3600) // URL действителен 1 час

      if (error) throw error
      return data.signedUrl
   } catch (error) {
      console.error('Error getting avatar URL:', error)
      return null
   }
}
