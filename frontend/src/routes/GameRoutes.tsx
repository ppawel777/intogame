import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'

const GamesPage = lazy(() => import('../pages/Games/GamesPage'))
const MyGames = lazy(() => import('../pages/Games/MyGames/MyGames'))

const GamesRoutes = () => (
   <Routes>
      <Route path="my-games/" element={<MyGames />} />
      <Route path="reserved/" element={<GamesPage />} />
      {/* <Route path="archive/" element={<GamesPage isArchive={true} />} /> */}
   </Routes>
)

export default GamesRoutes
