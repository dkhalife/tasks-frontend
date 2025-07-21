import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  GetTasks,
  GetTaskByID,
  MarkTaskComplete,
  DeleteTask,
  SkipTask,
  CreateTask,
  SaveTask,
  UpdateDueDate,
} from '@/api/tasks'
import { Task } from '@/models/task'
import { RootState } from './store'
import { SyncState } from '@/models/sync'
import { getDefaultExpandedState, GROUP_BY, groupTaskBy, groupTasksBy, TaskGroups } from '@/utils/grouping'
import { retrieveValue, storeValue } from '@/utils/storage'

export interface TasksState {
  items: Task[]

  searchQuery: string
  filteredItems: Task[]

  groupBy: GROUP_BY
  groupedItems: TaskGroups<Task>
  expandedGroups: Record<keyof TaskGroups<Task>, boolean>

  status: SyncState
  lastFetched: number | null
  error: string | null
}

const initialGroupBy = retrieveValue<GROUP_BY>('group_by', 'due_date')
const initialExpandedGroups = retrieveValue<Record<keyof TaskGroups<Task>, boolean>>(
  'expanded_groups',
  getDefaultExpandedState(initialGroupBy, []),
)

const initialState: TasksState = {
  items: [],

  searchQuery: '',
  filteredItems: [],

  groupBy: initialGroupBy,
  expandedGroups: initialExpandedGroups,
  groupedItems: {},

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

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (task: Omit<Task, 'id'>) => await CreateTask(task),
)

export const saveTask = createAsyncThunk(
  'tasks/saveTask',
  async (task: Task) => await SaveTask(task),
)

export const updateDueDate = createAsyncThunk(
  'tasks/updateDueDate',
  async ({ taskId, dueDate }: { taskId: string; dueDate: string }) => {
    const response = await UpdateDueDate(taskId, dueDate)
    return response.task
  },
)

export const setGroupBy = createAsyncThunk(
  'tasks/setGroupBy',
  async (groupBy: GROUP_BY, thunkAPI) => {
      const state = thunkAPI.getState() as RootState

      const userLabels = state.labels.items
      const tasks = state.tasks.items
      const nextExpanded = getDefaultExpandedState(groupBy, userLabels)
      const groupedItems = groupTasksBy(tasks, userLabels, groupBy)

      storeValue('group_by', groupBy)
      storeValue('expanded_groups', nextExpanded)

      return {
        groupBy,
        groupedItems: groupedItems,
        expandedGroups: nextExpanded,
      }
  },
)

export const initGroups = createAsyncThunk(
  'tasks/initGroups',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState() as RootState
    const userLabels = state.labels.items
    const tasks = state.tasks.items

    return groupTasksBy(tasks, userLabels, initialGroupBy)
  },
)

function taskMatchesQuery(task: Task, query: string): boolean {
  return task.title.toLowerCase().includes(query)
}

function filterItems(items: Task[], query: string): Task[] {
  if (query === '') {
    return items
  }

  const lowerQuery = query.toLowerCase()
  return items.filter(task => taskMatchesQuery(task, lowerQuery))
}

function deleteTaskFromGroups(taskId: string, groups: TaskGroups<Task>) {
  const keys = Object.keys(groups) as (keyof TaskGroups<Task>)[]

  keys.forEach(groupKey => {
    const group = groups[groupKey]
    group.content = group.content.filter(t => t.id !== taskId)
  })
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    filterTasks: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
      state.filteredItems = filterItems(state.items, action.payload)
    },
    taskUpserted: (state, action: PayloadAction<Task>) => {
      const index = state.items.findIndex(t => t.id === action.payload.id)
      if (index >= 0) {
        // Add to the main data source
        state.items[index] = action.payload

        // Add to the filtered items if it should be
        if (state.searchQuery === '') {
          state.filteredItems[index] = action.payload
        } else {
          const filteredIndex = state.filteredItems.findIndex(t => t.id === action.payload.id)
          if (filteredIndex >= 0) {
            state.filteredItems[filteredIndex] = action.payload
          }
        }

        // Add to the grouped list of items
        groupTaskBy(action.payload, state.groupedItems, state.groupBy)
      } else {
        state.items.push(action.payload)

        if (state.searchQuery === '' || taskMatchesQuery(action.payload, state.searchQuery.toLowerCase())) {
          state.filteredItems.push(action.payload)
        }
      }
    },
    taskDeleted: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(t => t.id !== action.payload)
      state.filteredItems = state.filteredItems.filter(t => t.id !== action.payload)

      deleteTaskFromGroups(action.payload, state.groupedItems)
    },
    toggleGroup: (state, action: PayloadAction<keyof TaskGroups<Task>>) => {
      const groupKey = action.payload
      const isExpanded = state.expandedGroups[groupKey]
      state.expandedGroups[groupKey] = !isExpanded

      storeValue('expanded_groups', state.expandedGroups)
    }
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
        state.filteredItems = filterItems(action.payload, state.searchQuery)
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

          if (state.searchQuery === '') {
            state.filteredItems[index] = task
          } else {
            const filteredIndex = state.filteredItems.findIndex(t => t.id === task.id)
            if (filteredIndex >= 0) {
              state.filteredItems[filteredIndex] = task
            }
          }
        } else {
          state.items.push(task)

          if (state.searchQuery === '' || taskMatchesQuery(task, state.searchQuery.toLowerCase())) {
            state.filteredItems.push(task)
          }
        }

        groupTaskBy(task, state.groupedItems, state.groupBy)

        state.status = 'succeeded'
        state.error = null
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? null
      })
      // Initialize groups
      .addCase(initGroups.pending, state => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(initGroups.fulfilled, (state, action) => {
        state.groupedItems = action.payload
        state.status = 'succeeded'
        state.error = null
      })
      .addCase(initGroups.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? null
      })
      // Change group by
      .addCase(setGroupBy.pending, state => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(setGroupBy.fulfilled, (state, action) => {
        state.groupBy = action.payload.groupBy
        state.groupedItems = action.payload.groupedItems
        state.expandedGroups = action.payload.expandedGroups
        state.status = 'succeeded'
        state.error = null
      })
      .addCase(setGroupBy.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? null
      })
      // Create tasks
      .addCase(createTask.pending, state => {
        state.status = 'loading'
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.status = 'succeeded'

        const taskId = action.payload.task
        const task: Task = {
          id: taskId,
          ...action.meta.arg,
        }

        state.items.push(task)
        if (state.searchQuery === '' || taskMatchesQuery(task, state.searchQuery.toLowerCase())) {
          state.filteredItems.push(task)
        }
        groupTaskBy(task, state.groupedItems, state.groupBy)

        state.error = null
      })
      .addCase(createTask.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? null
      })
      // Edit tasks
      .addCase(saveTask.pending, state => {
        state.status = 'loading'
      })
      .addCase(saveTask.fulfilled, (state, action) => {
        state.status = 'succeeded'

        const updatedTask = action.meta.arg
        const index = state.items.findIndex(t => t.id === updatedTask.id)
        if (index >= 0) {
          state.items[index] = updatedTask
        } else {
          state.items.push(updatedTask)
        }

        state.filteredItems = state.filteredItems.filter(t => t.id !== updatedTask.id)
        if (state.searchQuery === '' || taskMatchesQuery(updatedTask, state.searchQuery.toLowerCase())) {
          state.filteredItems.push(updatedTask)
        }

        deleteTaskFromGroups(updatedTask.id, state.groupedItems)
        groupTaskBy(updatedTask, state.groupedItems, state.groupBy)

        state.error = null
      })
      .addCase(saveTask.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? null
      })
      // Mark tasks as complete
      .addCase(completeTask.pending, state => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(completeTask.fulfilled, (state, action) => {
        const taskId = action.meta.arg
        // Remove the old entry with taskId
        state.items = state.items.filter(t => t.id !== taskId)
        state.filteredItems = state.filteredItems.filter(t => t.id !== taskId)
        deleteTaskFromGroups(taskId, state.groupedItems)

        // For recurring tasks, we might have a new task with the same ID but updated details
        const newTask = action.payload
        if (newTask.next_due_date) {
          state.items.push(newTask)

          if (state.searchQuery === '') {
            state.filteredItems.push(newTask)
          } else if (taskMatchesQuery(newTask, state.searchQuery.toLowerCase())) {
            state.filteredItems.push(newTask)
          }

          groupTaskBy(newTask, state.groupedItems, state.groupBy)
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
        state.filteredItems = state.filteredItems.filter(t => t.id !== taskId)
        deleteTaskFromGroups(taskId, state.groupedItems)

        const newTask = action.payload
        if (newTask.next_due_date) {
          state.items.push(newTask)

          if (state.searchQuery === '') {
            state.filteredItems.push(newTask)
          } else if (taskMatchesQuery(newTask, state.searchQuery.toLowerCase())) {
            state.filteredItems.push(newTask)
          }

          groupTaskBy(newTask, state.groupedItems, state.groupBy)
        }

        state.status = 'succeeded'
        state.error = null
      })
      .addCase(skipTask.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? null
      })
      // Update due date
      .addCase(updateDueDate.pending, state => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(updateDueDate.fulfilled, (state, action) => {
        const taskId = action.meta.arg.taskId
        const updatedTask = action.payload
        const index = state.items.findIndex(t => t.id === taskId)
        deleteTaskFromGroups(taskId, state.groupedItems)

        if (index >= 0) {
          state.items[index] = updatedTask

          if (state.searchQuery === '') {
            state.filteredItems[index] = updatedTask
          } else {
            const filteredIndex = state.filteredItems.findIndex(t => t.id === updatedTask.id)
            if (filteredIndex >= 0) {
              state.filteredItems[filteredIndex] = updatedTask
            }
          }
        } else {
          state.items.push(updatedTask)

          if (state.searchQuery === '') {
            state.filteredItems.push(updatedTask)
          } else if (taskMatchesQuery(updatedTask, state.searchQuery.toLowerCase())) {
            state.filteredItems.push(updatedTask)
          }
        }

        groupTaskBy(updatedTask, state.groupedItems, state.groupBy)

        state.status = 'succeeded'
        state.error = null
      })
      .addCase(updateDueDate.rejected, (state, action) => {
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
        state.filteredItems = state.filteredItems.filter(t => t.id !== action.meta.arg)
        deleteTaskFromGroups(action.meta.arg, state.groupedItems)
        state.error = null
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? null
      })
  },
})

export const { taskUpserted, taskDeleted, filterTasks, toggleGroup } = tasksSlice.actions

export const tasksReducer = tasksSlice.reducer
