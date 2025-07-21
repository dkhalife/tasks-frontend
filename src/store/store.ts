import { configureStore } from '@reduxjs/toolkit'
import { tasksReducer } from './tasksSlice'
import { labelsReducer } from './labelsSlice'
import { userReducer } from './userSlice'
import { tokensReducer } from './tokensSlice'

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    labels: labelsReducer,
    user: userReducer,
    tokens: tokensReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => store.dispatch
