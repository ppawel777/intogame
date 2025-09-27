import { useEffect } from 'react'
import s from './Home.module.scss'

const HomePage = () => {
   // Test backend
   useEffect(() => {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://intogame.ru'
      fetch(`${apiUrl}/api/health`, {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',
         },
      })
         .then((res) => {
            if (!res.ok) {
               throw new Error(`HTTP error! status: ${res.status}`)
            }
            return res.json()
         })
         .then((data) => {
            // eslint-disable-next-line no-console
            console.log('Backend health check:', data)
         })
         .catch((error) => {
            console.error('Backend health check failed:', error)
         })
   }, [])

   return <div className={s.wrap}></div>
}

export default HomePage
