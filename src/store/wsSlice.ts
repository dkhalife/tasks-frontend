import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SyncState } from '@/models/sync'

export interface WSState {
  status: SyncState
  error: string | null
  lastUpdated: number | null
}

const initialState: WSState = {
  status: 'loading',
  error: null,
  lastUpdated: null,
}

const wsSlice = createSlice({
  name: 'ws',
  initialState,
  reducers: {
    wsConnecting: (state) => {
      state.status = 'loading'
      state.error = null
      state.lastUpdated = null
    },
    wsConnected: (state) => {
      state.status = 'succeeded'
      state.error = null
      state.lastUpdated = Date.now()
    },
    wsDisconnected: (state, action: PayloadAction<string | null>) => {
      state.status = 'failed'
      state.error = action.payload
      state.lastUpdated = Date.now()
    },
  },
})

export const wsReducer = wsSlice.reducer
export const { wsConnecting, wsConnected, wsDisconnected } = wsSlice.actions
