import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { GetUserProfile } from '@/api/users'
import { User } from '@/models/user'

export interface UserState {
  profile: User | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: UserState = {
  profile: null,
  status: 'idle',
  error: null,
}

export const fetchUser = createAsyncThunk('user/fetchUser', async () => {
  const data = await GetUserProfile()
  return data.user
})

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchUser.pending, state => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.profile = action.payload
        state.error = null
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? null
      })
  },
})

export const userReducer = userSlice.reducer
