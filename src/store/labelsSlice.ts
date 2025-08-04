import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { Label } from '@/models/label'
import { CreateLabel, DeleteLabel, GetLabels, UpdateLabel } from '@/api/labels'
import { SyncState } from '@/models/sync'
import WebSocketManager from '@/utils/websocket'
import { store } from './store'

export interface LabelsState {
  items: Label[]
  isEditing: boolean
  status: SyncState
  lastFetched: number | null
  error: string | null
}

const initialState: LabelsState = {
  items: [],
  isEditing: false,
  status: 'loading',
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
  async (labelId: number) => await DeleteLabel(labelId)
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
    labelUpserted(state, action) {
      const upsertedLabel = action.payload
      const index = state.items.findIndex(label => label.id === upsertedLabel.id)
      if (index !== -1) {
        state.items[index] = upsertedLabel
      } else {
        state.items.push(upsertedLabel)
      }
    },
    labelDeleted(state, action) {
      state.items = state.items.filter(label => label.id !== action.payload)
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
        labelsSlice.caseReducers.labelUpserted(state, {
          payload: action.payload.label,
          type: 'labels/labelUpserted',
        })
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
        const label = action.payload.label
        labelsSlice.caseReducers.labelUpserted(state, {
          payload: label,
          type: 'labels/labelUpserted',
        })
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
        labelsSlice.caseReducers.labelDeleted(state, {
          payload: action.meta.arg,
          type: 'labels/labelDeleted',
        })
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

const { labelUpserted, labelDeleted } = labelsSlice.actions

const onLabelCreated = (data: unknown) => {
  const label = (data as any).label as Label
  store.dispatch(labelUpserted(label))
}

const onlabelUpserted = (data: unknown) => {
  const label = (data as any).label as Label
  store.dispatch(labelUpserted(label))
}

const onLabelDeleted = (data: unknown) => {
  const labelId = (data as any).id as number
  store.dispatch(labelDeleted(labelId))
}

export const registerWebSocketListeners = (ws: WebSocketManager) => {
  ws.on('label_created', onLabelCreated)
  ws.on('label_updated', onlabelUpserted)
  ws.on('label_deleted', onLabelDeleted)
}

export const unregisterWebSocketListeners = (ws: WebSocketManager) => {
  ws.off('label_created', onLabelCreated)
  ws.off('label_updated', onlabelUpserted)
  ws.off('label_deleted', onLabelDeleted)
}
