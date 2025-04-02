import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'

const Games = lazy(() => import('../pages/Games'))

const GamesRoutes = () => (
   <Routes>
      <Route path="reserved/" element={<Games />} />
      <Route path="archive/" element={<Games isArchive={true} />} />
   </Routes>
)

export default GamesRoutes
