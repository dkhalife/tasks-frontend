import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { tasksReducer } from './tasksSlice'
import { labelsReducer } from './labelsSlice'
import { userReducer } from './userSlice'
import { tokensReducer } from './tokensSlice'
import { historyReducer } from './historySlice'

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    labels: labelsReducer,
    user: userReducer,
    tokens: tokensReducer,
    history: historyReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
