import { CreateLongLivedToken, DeleteLongLivedToken, GetLongLivedTokens } from '@/api/tokens'
import { SyncState } from '@/models/sync'
import { APIToken, ApiTokenScope } from '@/models/token'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

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
  reducers: {},
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
        state.items.push(action.payload)
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
        state.items = state.items.filter(token => token.id !== action.meta.arg)
        state.error = null
      })
      .addCase(deleteToken.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? "An unknown error occurred while deleting the token."
      })
  },
})

export const tokensReducer = tokensSlice.reducer
