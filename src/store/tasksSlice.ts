import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { GetTasks, GetTaskByID } from '@/api/tasks'
import { Task } from '@/models/task'
import { RootState } from './store'

export interface TasksState {
  items: Task[]
  status: 'loading' | 'succeeded' | 'failed'
  lastFetched: number | null
  error: string | null
}

const initialState: TasksState = {
  items: [],
  status: 'loading',
  lastFetched: null,
  error: null,
}

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async () => {
  const data = await GetTasks()
  return data.tasks
})

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (id: string, thunkAPI) => {
    const state = thunkAPI.getState() as RootState
    const tasks = state.tasks.items
    const task = tasks.find(t => t.id === id)
    if (task) {
      return task
    }

    // Task is not in local state for some reason, fetch it from the API
    const data = await GetTaskByID(id)
    return data.task
  },
)

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    taskUpserted: (state, action: PayloadAction<Task>) => {
      const index = state.items.findIndex(t => t.id === action.payload.id)
      if (index >= 0) {
        state.items[index] = action.payload
      } else {
        state.items.push(action.payload)
      }
    },
    taskDeleted: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(t => t.id !== action.payload)
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTasks.pending, state => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
        state.lastFetched = Date.now()
        state.error = null
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? null
      })
      .addCase(fetchTaskById.pending, state => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        const task = action.payload
        const index = state.items.findIndex(t => t.id === task.id)
        if (index >= 0) {
          state.items[index] = task
        } else {
          state.items.push(task)
        }
        state.status = 'succeeded'
        state.error = null
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? null
      })
  },
})

export const { taskUpserted, taskDeleted } = tasksSlice.actions

export const tasksReducer = tasksSlice.reducer
