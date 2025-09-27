import { useEffect } from 'react'
import s from './Home.module.scss'

const HomePage = () => {
   // Test backend
   useEffect(() => {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/health`)
         .then((res) => res.json())
         .then((data) => console.log(data))
   }, [])

   return <div className={s.wrap}></div>
}

export default HomePage
