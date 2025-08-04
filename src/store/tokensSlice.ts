import { CreateLongLivedToken, DeleteLongLivedToken, GetLongLivedTokens } from '@/api/tokens'
import { SyncState } from '@/models/sync'
import { APIToken, ApiTokenScope } from '@/models/token'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import WebSocketManager from '@/utils/websocket'
import { store } from './store'

export interface TokensState {
  items: APIToken[]
  isEditing: boolean
  status: SyncState
  lastFetched: number | null
  error: string | null
}

const initialState: TokensState = {
  items: [],
  isEditing: false,
  status: 'loading',
  lastFetched: null,
  error: null,
}

export const fetchTokens = createAsyncThunk(
  'tokens/fetchTokens',
  async () => await GetLongLivedTokens())

export const createToken = createAsyncThunk(
  'tokens/createToken',
  async (token: {
    name: string,
    scopes: ApiTokenScope[],
    expiration: number,
  }) => (await CreateLongLivedToken(token.name, token.scopes, token.expiration)).token
)

export const deleteToken = createAsyncThunk(
  'tokens/deleteToken',
  async (tokenId: string) => await DeleteLongLivedToken(tokenId)
)

const tokensSlice = createSlice({
  name: 'tokens',
  initialState,
  reducers: {
    tokenUpserted(state, action) {
      const token = action.payload as APIToken
      const index = state.items.findIndex(t => t.id === token.id)
      if (index !== -1) {
        state.items[index] = token
      } else {
        state.items.push(token)
      }
    },
    tokenDeleted(state, action) {
      state.items = state.items.filter(token => token.id !== action.payload)
    },
  },
  extraReducers: builder => {
    builder
      // Fetching tokens
      .addCase(fetchTokens.pending, state => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchTokens.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.tokens
        state.lastFetched = Date.now()
        state.error = null
      })
      .addCase(fetchTokens.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? "An unknown error occurred while fetching tokens."
      })
      // Creating tokens
      .addCase(createToken.pending, state => {
        state.status = 'loading'
      })
      .addCase(createToken.fulfilled, (state, action) => {
        state.status = 'succeeded'
        tokensSlice.caseReducers.tokenUpserted(state, {
          payload: action.payload,
          type: 'tokens/tokenUpserted',
        })
        state.error = null
      })
      .addCase(createToken.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? "An unknown error occurred while creating the token."
      })
      // Deleting tokens
      .addCase(deleteToken.pending, state => {
        state.status = 'loading'
      })
      .addCase(deleteToken.fulfilled, (state, action) => {
        state.status = 'succeeded'
        tokensSlice.caseReducers.tokenDeleted(state, {
          payload: action.meta.arg,
          type: 'tokens/tokenDeleted',
        })
        state.error = null
      })
      .addCase(deleteToken.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? "An unknown error occurred while deleting the token."
      })
  },
})

export const tokensReducer = tokensSlice.reducer

const { tokenUpserted, tokenDeleted } = tokensSlice.actions

const onTokenCreated = (data: unknown) => {
  const token = (data as any).token as APIToken
  store.dispatch(tokenUpserted(token))
}

const onTokenDeleted = (data: unknown) => {
  const tokenId = (data as any).id as string
  store.dispatch(tokenDeleted(tokenId))
}

export const registerWebSocketListeners = (ws: WebSocketManager) => {
  ws.on('app_token_created', onTokenCreated)
  ws.on('app_token_deleted', onTokenDeleted)
}

export const unregisterWebSocketListeners = (ws: WebSocketManager) => {
  ws.off('app_token_created', onTokenCreated)
  ws.off('app_token_deleted', onTokenDeleted)
}
