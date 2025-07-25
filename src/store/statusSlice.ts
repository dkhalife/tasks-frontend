import { createSlice, PayloadAction, nanoid } from '@reduxjs/toolkit'
import { Status } from '@/models/status'
import { AppDispatch } from './store'

export interface StatusState {
  items: Status[]
}

const initialState: StatusState = {
  items: [],
}

const statusSlice = createSlice({
  name: 'status',
  initialState,
  reducers: {
    addStatus: (state, action: PayloadAction<Status>) => {
      state.items.push(action.payload)
    },
    dismissStatus: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(status => status.id !== action.payload)
    },
  },
})

export const statusReducer = statusSlice.reducer
const { addStatus, dismissStatus } = statusSlice.actions
export { dismissStatus }

export const pushStatus = (
  status: Omit<Status, 'id' | 'createdAt'>,
) => (dispatch: AppDispatch) => {
  const id = nanoid()
  const createdAt = Date.now()
  dispatch(addStatus({ ...status, id, createdAt }))
  if (status.timeout) {
    setTimeout(() => dispatch(dismissStatus(id)), status.timeout)
  }
  return id
}
