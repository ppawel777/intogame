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
      // 30 days
      document.cookie = `${name}=${value};secure;max-age=2592000;path=/`
   } else {
      document.cookie = `${name}=${value};secure;max-age=${maxAge};path=/`
   }
}

export const delete_cookie = (cookie_name: string) => {
   document.cookie = cookie_name + '=;max-age=0;path=/'
}

// Удаление всех токенов и обновление страницы
export const deleteAuth = () => {
   delete_cookie('access_token')
   delete_cookie('refresh_token')
   location.reload()
}

// Проверяет истечение срока JWT
const isJwtExpired = (token: string): boolean => {
   try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const exp = payload.exp * 1000
      return Date.now() > exp
   } catch {
      return true
   }
}

// Проверка налачия cookies авторизации, установленных в браузере
export const checkAvailableCookies = () => {
   const refreshToken = get_cookie('refresh_token')
   const accessToken = get_cookie('access_token')

   if (!refreshToken || !accessToken) return false

   // Проверка истечения срока токена
   return !isJwtExpired(accessToken)
}
