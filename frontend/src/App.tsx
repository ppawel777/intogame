import { ConfigProvider } from 'antd'
import { AuthProvider } from './context/providers/AuthProvider/AuthProvider'
import RoutesComponent from './routes/Routes'
import ruRU from 'antd/lib/locale/ru_RU'

const theme = {
   token: {
      colorPrimary: '#61b556',
      borderRadius: 4,
      fontSize: 14,
      borderRadiusLG: 4,
      borderRadiusSM: 4,
   },
   // components: {
   //    Button: {
   //       borderRadius: 4,
   //    },
   //    Input: {
   //       borderRadius: 4,
   //    },
   // },
}

const App = () => (
   <ConfigProvider locale={ruRU} theme={theme}>
      <AuthProvider>
         <RoutesComponent />
      </AuthProvider>
   </ConfigProvider>
)

export default App
