import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { GetTasks, GetTaskByID } from '@/api/tasks'
import { Task } from '@/models/task'

export interface TasksState {
  tasks: Task[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  lastFetched: number | null
  error: string | null
}

const initialState: TasksState = {
  tasks: [],
  status: 'idle',
  lastFetched: null,
  error: null,
}

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async () => {
  const data = await GetTasks()
  return data.tasks
})

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (id: string) => {
    const data = await GetTaskByID(id)
    return data.task
  },
)

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    taskUpserted: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.id)
      if (index >= 0) {
        state.tasks[index] = action.payload
      } else {
        state.tasks.push(action.payload)
      }
    },
    taskDeleted: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload)
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
        state.tasks = action.payload
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
        const index = state.tasks.findIndex(t => t.id === task.id)
        if (index >= 0) {
          state.tasks[index] = task
        } else {
          state.tasks.push(task)
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

export default tasksSlice.reducer
