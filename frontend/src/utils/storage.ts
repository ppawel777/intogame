import { supabase } from '@supabaseDir/supabaseClient'

const BUCKET_NAME = 'profile_photo_users'

export const upload_avatar = async (file: File, userId: string): Promise<string | null> => {
   try {
      const fileExt = file.name.split('.').pop()
      // Используем простое имя файла без дублирования userId
      const filePath = `${userId}/avatar.${fileExt}` // Правильная структура для RLS

      // Получаем текущий avatar_url
      const { data: userData, error: userError } = await supabase
         .from('users')
         .select('avatar_url')
         .eq('uuid', userId)
         .single()

      if (userError) throw userError

      const oldAvatarPath = userData?.avatar_url

      // Удаляем старый, если есть и он отличается от нового
      if (oldAvatarPath && oldAvatarPath !== filePath) {
         const { error: removeError } = await supabase.storage.from(BUCKET_NAME).remove([oldAvatarPath])

         if (removeError) {
            console.error('Error removing old avatar:', removeError)
         }
      }

      // Загружаем новый (upsert перезапишет, если уже есть)
      const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, {
         upsert: true,
         cacheControl: '3600',
         contentType: file.type,
      })

      if (uploadError) throw uploadError

      console.log(`[upload_avatar] ✅ Файл загружен: ${filePath}`)
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
      // Пробуем загрузить по исходному пути
      const { data, error } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(fileName, 3600)

      // Если ошибка - пробуем альтернативные пути
      if (error && fileName.includes('/')) {
         const parts = fileName.split('/')

         if (parts.length === 2) {
            const [folder, file] = parts

            // Fallback 1: Если дубликат (uuid/uuid.ext), пробуем просто uuid.ext
            if (file.startsWith(folder)) {
               const fallbackResult = await supabase.storage.from(BUCKET_NAME).createSignedUrl(file, 3600)

               if (!fallbackResult.error) {
                  console.log(`[get_avatar_url] ✅ Исправлен дубликат: ${fileName} -> ${file}`)
                  return fallbackResult.data.signedUrl
               }
            }

            // Fallback 2: Пробуем новый формат uuid/avatar.ext
            const ext = file.split('.').pop()
            const newFormatPath = `${folder}/avatar.${ext}`

            if (newFormatPath !== fileName) {
               const newFormatResult = await supabase.storage.from(BUCKET_NAME).createSignedUrl(newFormatPath, 3600)

               if (!newFormatResult.error) {
                  console.log(`[get_avatar_url] ✅ Найден новый формат: ${fileName} -> ${newFormatPath}`)
                  return newFormatResult.data.signedUrl
               }
            }
         }
      }

      if (error) throw error

      return data.signedUrl
   } catch (error: any) {
      console.error(`[get_avatar_url] ❌ Файл не найден: ${fileName}`)
      return null
   }
}
