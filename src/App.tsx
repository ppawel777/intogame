import { AuthProvider } from './context/providers/AuthProvider/AuthProvider'
import RoutesComponent from './routes/Routes'

const App = () => (
   <AuthProvider>
      <RoutesComponent />
   </AuthProvider>
)

export default App
