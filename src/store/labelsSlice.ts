import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { GetLabels } from '@/api/labels'
import { Label } from '@/models/label'

export interface LabelsState {
  labels: Label[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  lastFetched: number | null
  error: string | null
}

const initialState: LabelsState = {
  labels: [],
  status: 'idle',
  lastFetched: null,
  error: null,
}

export const fetchLabels = createAsyncThunk('labels/fetchLabels', async () => {
  const data = await GetLabels()
  return data.labels
})

const labelsSlice = createSlice({
  name: 'labels',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchLabels.pending, state => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchLabels.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.labels = action.payload
        state.lastFetched = Date.now()
        state.error = null
      })
      .addCase(fetchLabels.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? "An unknown error occurred while fetching labels."
      })
  },
})

export default labelsSlice.reducer
