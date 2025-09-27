import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'

const GamesPage = lazy(() => import('../pages/Games/GamesPage'))

const GamesRoutes = () => (
   <Routes>
      <Route path="reserved/" element={<GamesPage />} />
      <Route path="archive/" element={<GamesPage isArchive={true} />} />
   </Routes>
)

export default GamesRoutes
