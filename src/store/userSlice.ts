import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { GetUserProfile, UpdateNotificationSettings } from '@/api/users'
import { User } from '@/models/user'
import { NotificationTriggerOptions, NotificationType } from '@/models/notifications'
import { SyncState } from '@/models/sync'

export interface UserState {
  profile: User
  status: SyncState
  lastFetched: number | null
  error: string | null
}

const initialState: UserState = {
  profile: {
    display_name: '',
    notifications: {
      provider: {
        provider: 'none'
      },
      triggers: {
        pre_due: false,
        due_date: false,
        overdue: false,
      },
    },
  },
  status: 'loading',
  lastFetched: null,
  error: null,
}

export const fetchUser = createAsyncThunk('user/fetchUser', async () => {
  const data = await GetUserProfile()
  return data.user
})

export const updateNotificationSettings = createAsyncThunk(
  'user/updateNotificationSettings',
  async (settings: { type: NotificationType, options: NotificationTriggerOptions}) => await UpdateNotificationSettings(settings.type, settings.options))

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
        state.lastFetched = Date.now()
        state.error = null
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? null
      })
  },
})

export const userReducer = userSlice.reducer
