import { Provider } from 'react-redux'

import { createReduxStore } from '../config/store'
// @ts-ignore
import type { DeepPartial, ReducersMapObject } from '@reduxjs/toolkit'
import type { ReactNode } from 'react'
import type { StateSchema } from '../config/StateSchema'

interface StoreProviderProps {
   children: ReactNode
   initialState?: DeepPartial<StateSchema>
   asyncReducers?: DeepPartial<ReducersMapObject<StateSchema>>
}

export const StoreProvider = ({ children, initialState, asyncReducers }: StoreProviderProps) => {
   const storeRTK = createReduxStore(initialState as StateSchema, asyncReducers as ReducersMapObject<StateSchema>)

   return <Provider store={storeRTK}>{children}</Provider>
}

type propertiesTypes<T> = T extends { [key: string]: infer U } ? U : never
export type inferActionsTypes<T extends { [key: string]: (...args: any[]) => any }> = ReturnType<propertiesTypes<T>>
