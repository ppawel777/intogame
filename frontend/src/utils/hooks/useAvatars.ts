import { useEffect, useState } from 'react'
import { get_avatar_url } from '@utils/storage'

// In-memory кэш для быстрого доступа
const avatarCache = new Map<string, string>()

// Ключ для sessionStorage
const CACHE_KEY = 'avatars_cache'
const CACHE_TTL = 1000 * 60 * 60 // 1 час

type CacheEntry = {
   url: string
   timestamp: number
}

// Загрузка кэша из sessionStorage при инициализации модуля
const loadCacheFromStorage = () => {
   try {
      const stored = sessionStorage.getItem(CACHE_KEY)
      if (stored) {
         const cache: Record<string, CacheEntry> = JSON.parse(stored)
         const now = Date.now()

         // Загружаем только актуальные записи
         Object.entries(cache).forEach(([key, entry]) => {
            if (now - entry.timestamp < CACHE_TTL) {
               avatarCache.set(key, entry.url)
            }
         })
      }
   } catch (error) {
      console.error('Ошибка загрузки кэша аватарок:', error)
   }
}

// Сохранение кэша в sessionStorage
const saveCacheToStorage = () => {
   try {
      const cache: Record<string, CacheEntry> = {}
      const now = Date.now()

      avatarCache.forEach((url, key) => {
         cache[key] = { url, timestamp: now }
      })

      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache))
   } catch (error) {
      console.error('Ошибка сохранения кэша аватарок:', error)
   }
}

// Инициализация кэша при загрузке модуля
loadCacheFromStorage()

// Множество для отслеживания загружаемых аватарок (избегаем дублирования запросов)
const loadingAvatars = new Set<string>()

// Множество для отслеживания аватарок с ошибками (избегаем повторных запросов к несуществующим файлам)
const failedAvatars = new Set<string>()

/**
 * Хук для загрузки и кэширования аватарок пользователей
 *
 * @param avatarPaths - массив путей к аватаркам в storage
 * @returns объект с загруженными URL (ключ - путь в storage, значение - публичный URL)
 *
 * @example
 * const users = [{ id: 1, avatar_url: 'avatars/user1.jpg' }, ...]
 * const avatarUrls = useAvatars(users.map(u => u.avatar_url).filter(Boolean))
 *
 * // Использование:
 * <Avatar src={avatarUrls[user.avatar_url]} />
 */
export const useAvatars = (avatarPaths: (string | null | undefined)[]): Record<string, string> => {
   const [avatarUrls, setAvatarUrls] = useState<Record<string, string>>({})

   useEffect(() => {
      // Фильтруем только валидные пути
      const validPaths = avatarPaths.filter((path): path is string => Boolean(path))

      if (validPaths.length === 0) return

      // Разделяем на закэшированные и требующие загрузки
      const cached: Record<string, string> = {}
      const toLoad: string[] = []

      validPaths.forEach((path) => {
         if (avatarCache.has(path)) {
            cached[path] = avatarCache.get(path)!
         } else if (!loadingAvatars.has(path) && !failedAvatars.has(path)) {
            toLoad.push(path)
         }
      })

      // Устанавливаем закэшированные сразу
      if (Object.keys(cached).length > 0) {
         setAvatarUrls((prev) => ({ ...prev, ...cached }))
      }

      // Загружаем недостающие аватарки параллельно
      if (toLoad.length > 0) {
         // Отмечаем как загружаемые
         toLoad.forEach((path) => loadingAvatars.add(path))

         // Загружаем все параллельно
         Promise.allSettled(
            toLoad.map(async (path) => {
               try {
                  const url = await get_avatar_url(path)
                  if (url) {
                     // Сохраняем в in-memory кэш
                     avatarCache.set(path, url)
                     return { path, url }
                  } else {
                     // Если URL не получен, помечаем как неудачный
                     failedAvatars.add(path)
                     return null
                  }
               } catch (error) {
                  console.error(`Ошибка загрузки аватарки ${path}:`, error)
                  failedAvatars.add(path)
                  return null
               } finally {
                  // Удаляем из множества загружаемых
                  loadingAvatars.delete(path)
               }
            }),
         ).then((results) => {
            const loaded: Record<string, string> = {}
            let hasNewUrls = false

            results.forEach((result) => {
               if (result.status === 'fulfilled' && result.value) {
                  const { path, url } = result.value
                  loaded[path] = url
                  hasNewUrls = true
               }
            })

            if (hasNewUrls) {
               setAvatarUrls((prev) => ({ ...prev, ...loaded }))
               // Сохраняем обновленный кэш в sessionStorage
               saveCacheToStorage()
            }
         })
      }
   }, [avatarPaths.join(',')]) // Зависимость от строки путей

   return avatarUrls
}

/**
 * Очистка кэша аватарок (полезно при логауте)
 */
export const clearAvatarCache = () => {
   avatarCache.clear()
   failedAvatars.clear()
   sessionStorage.removeItem(CACHE_KEY)
}

/**
 * Предзагрузка аватарок (опционально, для критичных мест)
 */
export const preloadAvatars = async (avatarPaths: string[]) => {
   const toLoad = avatarPaths.filter((path) => path && !avatarCache.has(path))

   if (toLoad.length === 0) return

   await Promise.allSettled(
      toLoad.map(async (path) => {
         try {
            const url = await get_avatar_url(path)
            if (url) {
               avatarCache.set(path, url)
               return { path, url }
            }
         } catch (error) {
            console.error(`Ошибка предзагрузки аватарки ${path}:`, error)
         }
         return null
      }),
   )

   saveCacheToStorage()
}
