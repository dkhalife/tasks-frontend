import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { GetUserProfile } from '@/api/users'
import { User } from '@/models/user'

export interface UserState {
  user: User | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: UserState = {
  user: null,
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
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
    },
    clearUser: state => {
      state.user = null
      state.status = 'idle'
      state.error = null
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchUser.pending, state => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload
        state.error = null
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? null
      })
  },
})

export const { setUser, clearUser } = userSlice.actions
export default userSlice.reducer
