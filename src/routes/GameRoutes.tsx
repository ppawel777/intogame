import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'

const ReservedGame = lazy(() => import('../pages/Games/Reserved'))
const ArchiveGames = lazy(() => import('../pages/Games/Archive'))

const GamesRoutes = () => (
   <Routes>
      <Route path="reserved/" element={<ReservedGame />} />
      <Route path="archive/" element={<ArchiveGames />} />
   </Routes>
)

export default GamesRoutes
