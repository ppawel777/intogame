import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'

import App from './App'

import './index.scss'
import './layouts/main.scss'

const ViGruApp = (
   <HashRouter>
      <App />
   </HashRouter>
)

ReactDOM.createRoot(document.getElementById('wrap') as HTMLElement).render(ViGruApp)
