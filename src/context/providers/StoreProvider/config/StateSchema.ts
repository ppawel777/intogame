import { RootStore } from 'index'
// @ts-ignore
import { AnyAction, CombinedState, EnhancedStore } from '@reduxjs/toolkit'
import { Reducer, ReducersMapObject } from 'redux'

import { instanceAxios } from '@api/api'

import type { ExpressionFunctionsSchema } from '@store/expressionFunctions/expressionFunctionsSlice'
import type { HeaderSchema } from '@store/header/headerSlice'
import type { InventoryConfiguratorSchema } from '@store/inventoryConfigurator/inventoryConfiguratorSlice'
import type { MnemonicSchema } from '@store/mnemonics/mnemonicSlice'
import type { MonitoringPoliciesSchema } from '@store/monitoringPolicies/monitoringPoliciesSlice'
import type { PageManagerSchema } from '@store/pageManager/pageManagerSlice'
import type { SpecificationMetricsSchema } from '@store/specificationMetrics/specificationMetricsSlice'
import type { UserProfileSchema } from '@store/userProfile/userProfileSlice'
import type { ApiObj } from './../api'
import { UpstreamHostsSchema } from '@store/upstreamHosts/upstreamHosts-slice'

export interface StateSchema extends RootStore {
   // sync reducers
   userProfile: UserProfileSchema
   header: HeaderSchema
   mnemonic: MnemonicSchema
   monitoringPolicies: MonitoringPoliciesSchema
   expressionFunctions: ExpressionFunctionsSchema
   specificationMetrics: SpecificationMetricsSchema
   inventoryConfiguratorRTK: InventoryConfiguratorSchema
   pageManagerRTK: PageManagerSchema
   upstreamHosts: UpstreamHostsSchema

   // async reducers
}

export type StateSchemaKey = keyof StateSchema

export interface ReducerManager {
   getReducerMap: () => ReducersMapObject<StateSchema>
   reduce: (state: StateSchema, action: AnyAction) => CombinedState<StateSchema>
   add: (key: StateSchemaKey, reducer: Reducer) => void
   remove: (key: StateSchemaKey) => void
}

export interface ReduxStoreManager extends EnhancedStore<StateSchema> {
   reducerManager: ReducerManager
}

export interface ThunkExtraArg {
   api: typeof instanceAxios
   apiObj: ApiObj
}

export interface ThunkConfig<T> {
   rejectValue: T
   extra: ThunkExtraArg
}
