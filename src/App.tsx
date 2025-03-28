import { ConfigProvider } from 'antd'
import { AuthProvider } from './context/providers/AuthProvider/AuthProvider'
import RoutesComponent from './routes/Routes'
import ruRU from 'antd/lib/locale/ru_RU'

const App = () => (
   <ConfigProvider
      locale={ruRU}
      // theme={{
      //    token: {
      //       borderRadius: 2,
      //       borderRadiusLG: 2,
      //       borderRadiusSM: 2,
      //    },
      // }}
   >
      <AuthProvider>
         <RoutesComponent />
      </AuthProvider>
   </ConfigProvider>
)

export default App
