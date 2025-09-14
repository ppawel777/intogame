import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
// import { StoreProvider } from '@context/providers/StoreProvider'
// import { applyMiddleware, compose, createStore } from 'redux'
// import { rootReducer } from './store/reducers'
// import { thunk } from 'redux-thunk'

import App from './App'

import './index.scss'
import './layouts/main.scss'

// @ts-ignore
// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
// const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)))

const IntoGame = (
   // <StoreProvider>
   <HashRouter>
      <App />
   </HashRouter>
   // </StoreProvider>
)

// type reducersType = typeof rootReducer
// export type RootStore = ReturnType<reducersType>

// type propertiesTypes<T> = T extends { [key: string]: infer U } ? U : never
// export type inferActionsTypes<T extends { [key: string]: (...args: any[]) => any }> = ReturnType<propertiesTypes<T>>

// export type RootState = ReturnType<typeof store.getState>

ReactDOM.createRoot(document.getElementById('wrap') as HTMLElement).render(IntoGame)
