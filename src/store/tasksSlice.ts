import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  GetTasks,
  GetTaskByID,
  MarkTaskComplete,
  DeleteTask,
  SkipTask,
} from '@/api/tasks'
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

export const completeTask = createAsyncThunk(
  'tasks/completeTask',
  async (taskId: string) => {
    const response = await MarkTaskComplete(taskId)
    return response.task
  },
)

export const skipTask = createAsyncThunk(
  'tasks/skipTask',
  async (taskId: string) => {
    const response = await SkipTask(taskId)
    return response.task
  },
)

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

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: string) => await DeleteTask(taskId),
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
      // Fetch tasks
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
      // Fetch a specific task by ID
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
      // Edit tasks
      .addCase(completeTask.pending, state => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(completeTask.fulfilled, (state, action) => {
        const taskId = action.meta.arg
        // Remove the old entry with taskId
        state.items = state.items.filter(t => t.id !== taskId)

        // For recurring tasks, we might have a new task with the same ID but updated details
        const newTask = action.payload
        if (newTask.next_due_date) {
          state.items.push(newTask)
        }

        state.status = 'succeeded'
        state.error = null
      })
      .addCase(completeTask.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? null
      })
      // Skip tasks
      .addCase(skipTask.pending, state => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(skipTask.fulfilled, (state, action) => {
        const taskId = action.meta.arg
        state.items = state.items.filter(t => t.id !== taskId)

        const newTask = action.payload
        if (newTask.next_due_date) {
          state.items.push(newTask)
        }

        state.status = 'succeeded'
        state.error = null
      })
      .addCase(skipTask.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? null
      })
      // Deleting tasks
      .addCase(deleteTask.pending, state => {
        state.status = 'loading'
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = state.items.filter(t => t.id !== action.meta.arg)
        state.error = null
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? null
      })
  },
})

export const { taskUpserted, taskDeleted } = tasksSlice.actions

export const tasksReducer = tasksSlice.reducer
