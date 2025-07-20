import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { Label } from '@/models/label'
import { CreateLabel, DeleteLabel, GetLabels, UpdateLabel } from '@/api/labels'

export interface LabelsState {
  items: Label[]
  isEditing: boolean
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  lastFetched: number | null
  error: string | null
}

const initialState: LabelsState = {
  items: [],
  isEditing: false,
  status: 'idle',
  lastFetched: null,
  error: null,
}

export const fetchLabels = createAsyncThunk(
  'labels/fetchLabels', 
  async () => await GetLabels())

export const createLabel = createAsyncThunk(
  'labels/createLabel',
  async (label: Omit<Label, 'id'>) => await CreateLabel(label)
)

export const updateLabel = createAsyncThunk(
  'labels/updateLabel',
  async (label: Label) => await UpdateLabel(label)
)

export const deleteLabel = createAsyncThunk(
  'labels/deleteLabel',
  async (labelId: string) => await DeleteLabel(labelId)
)

const labelsSlice = createSlice({
  name: 'labels',
  initialState,
  reducers: {
    enterEditMode(state) {
      state.isEditing = true
    },
    exitEditMode(state) {
      state.isEditing = false
    },
  },
  extraReducers: builder => {
    builder
      // Fetching labels
      .addCase(fetchLabels.pending, state => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchLabels.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.labels
        state.lastFetched = Date.now()
        state.error = null
      })
      .addCase(fetchLabels.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? "An unknown error occurred while fetching labels."
      })
      // Creating labels
      .addCase(createLabel.pending, state => {
        state.status = 'loading'
      })
      .addCase(createLabel.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items.push(action.payload.label)
        state.error = null
      })
      .addCase(createLabel.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? "An unknown error occurred while creating the label."
      })
      // Updating labels
      .addCase(updateLabel.pending, state => {
        state.status = 'loading'
      })
      .addCase(updateLabel.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const updatedLabel = action.payload.label
        const index = state.items.findIndex(label => label.id === updatedLabel.id)
        if (index !== -1) {
          state.items[index] = updatedLabel
        }
        state.error = null
      })
      .addCase(updateLabel.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? "An unknown error occurred while updating the label."
      })
      // Deleting labels
      .addCase(deleteLabel.pending, state => {
        state.status = 'loading'
      })
      .addCase(deleteLabel.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = state.items.filter(label => label.id !== action.meta.arg)
        state.error = null
      })
      .addCase(deleteLabel.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? "An unknown error occurred while deleting the label."
      })
  },
})

export const labelsReducer = labelsSlice.reducer
export const { enterEditMode, exitEditMode } = labelsSlice.actions
