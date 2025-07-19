import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { GetTasks, GetTaskByID } from '@/api/tasks'
import { Task } from '@/models/task'

export interface TasksState {
  tasks: Task[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  lastFetched: number | null
}

const initialState: TasksState = {
  tasks: [],
  status: 'idle',
  lastFetched: null,
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
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchTasks.pending, state => {
        state.status = 'loading'
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.tasks = action.payload
        state.lastFetched = Date.now()
      })
      .addCase(fetchTasks.rejected, state => {
        state.status = 'failed'
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        const task = action.payload
        const index = state.tasks.findIndex(t => t.id === task.id)
        if (index >= 0) {
          state.tasks[index] = task
        } else {
          state.tasks.push(task)
        }
      })
  },
})

export default tasksSlice.reducer
