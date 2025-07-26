import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { GetTaskHistory } from '@/api/tasks'
import { SyncState } from '@/models/sync'
import { HistoryEntryUI, MakeHistoryUI } from '@/utils/marshalling'

export interface HistoryState {
  entries: HistoryEntryUI[]
  status: SyncState
  lastFetched: number | null
  error: string | null
}

const initialState: HistoryState = {
  entries: [],
  status: 'loading',
  lastFetched: null,
  error: null,
}

export const fetchTaskHistory = createAsyncThunk(
  'history/fetchTaskHistory',
  async (taskId: number) => {
    const data = await GetTaskHistory(taskId)
    return data.history.map(MakeHistoryUI)
  },
)

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    clearHistory(state) {
      state.entries = []
      state.status = 'loading'
      state.lastFetched = null
      state.error = null
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTaskHistory.pending, state => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchTaskHistory.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.entries = action.payload
        state.lastFetched = Date.now()
        state.error = null
      })
      .addCase(fetchTaskHistory.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ??
          'An unknown error occurred while fetching history.'
      })
  },
})

export const historyReducer = historySlice.reducer
export const { clearHistory } = historySlice.actions
