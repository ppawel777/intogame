// @ts-ignore
import { CombinedState, Reducer, ReducersMapObject, configureStore } from '@reduxjs/toolkit'

import { instanceAxios } from '@api/api'
import { expressionFunctionsReducer } from '@store/expressionFunctions/expressionFunctionsSlice'
import { headerReducer } from '@store/header/headerSlice'
import { inventoryConfiguratorReducer } from '@store/inventoryConfigurator/inventoryConfiguratorSlice'
import { mnemonicsReducer } from '@store/mnemonics/mnemonicSlice'
import { monitoringPoliciesReducer } from '@store/monitoringPolicies/monitoringPoliciesSlice'
import { pageManagerReducer } from '@store/pageManager/pageManagerSlice'
import { reducers } from '@store/reducers'
import { specificationMetricsReducer } from '@store/specificationMetrics/specificationMetricsSlice'
import { userProfileReducer } from '@store/userProfile/userProfileSlice'
import { upsteamHostReducer } from '@store/upstreamHosts/upstreamHosts-slice'
import { apiObj } from '../api'
import { createReducerManager } from './reducerManager'

import type { StateSchema, ThunkExtraArg } from './StateSchema'

export function createReduxStore(initialState?: StateSchema, asyncReducers?: ReducersMapObject<StateSchema>) {
   // @ts-ignore
   const rootReducers: ReducersMapObject<StateSchema> = {
      ...reducers,
      ...asyncReducers,
      userProfile: userProfileReducer,
      header: headerReducer,
      mnemonic: mnemonicsReducer,
      monitoringPolicies: monitoringPoliciesReducer,
      expressionFunctions: expressionFunctionsReducer,
      specificationMetrics: specificationMetricsReducer,
      upstreamHosts: upsteamHostReducer,

      // редюсеры которые имеют 2 сущности в RTK и Redux
      inventoryConfiguratorRTK: inventoryConfiguratorReducer,
      pageManagerRTK: pageManagerReducer,
   }

   const reducerManager = createReducerManager(rootReducers)

   const extraArg: ThunkExtraArg = {
      api: instanceAxios,
      apiObj: apiObj,
   }

   const store = configureStore({
      reducer: reducerManager.reduce as Reducer<CombinedState<StateSchema>>,
      devTools: true,
      preloadedState: initialState,

      middleware: (getDefaultMiddleware) =>
         getDefaultMiddleware({
            thunk: {
               extraArgument: extraArg,
            },
            asyncReducers,
            serializableCheck: false,
            immutableCheck: false,
         }),
   })

   // @ts-ignore
   store.reducerManager = reducerManager

   return store
}

export type AppDispatch = ReturnType<typeof createReduxStore>['dispatch']
