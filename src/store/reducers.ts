import { combineReducers } from 'redux'
import { activatorListReducer, changePropCurrentActivatorValues } from './activator/reducers'

export const reducers = {
   userProfile: codeReducer,
}

export const rootReducer = combineReducers(reducers)
