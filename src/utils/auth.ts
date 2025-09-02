// @utils/auth.ts

import { supabase } from '@supabaseDir/supabaseClient'

export const get_cookie = (cookieName: string): string | null => {
   const regex = new RegExp('(^|;)?' + cookieName + '=([^;]*)(;|$)')
   const results = document.cookie.match(regex)
   return results ? decodeURIComponent(results[2]) : null
}

type CookiesTypes = {
   name: string
   value: string
   maxAge?: number
   isRemember?: boolean
}

// default 30 days
export const set_cookie = ({ name, value, isRemember, maxAge = 2592000 }: CookiesTypes) => {
   if (isRemember) {
      document.cookie = `${name}=${value};Secure;Max-Age=2592000;Path=/`
   } else {
      document.cookie = `${name}=${value};Secure;Max-Age=${maxAge};Path=/`
   }
}

export const delete_cookie = (cookie_name: string) => {
   document.cookie = `${cookie_name}=;Max-Age=0;Path=/`
}

// Удаление всех токенов
export const deleteAuth = () => {
   delete_cookie('access_token')
   delete_cookie('refresh_token')
   supabase.auth.signOut().catch(console.error)
   // window.location.reload()
}

// Проверка наличия кук (быстрая)
export const checkAvailableCookies = (): boolean => {
   const hasAccess = get_cookie('access_token')
   const hasRefresh = get_cookie('refresh_token')
   return !!hasAccess || !!hasRefresh
}
