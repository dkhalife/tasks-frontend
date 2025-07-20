import { Task } from '@/models/task'
import { Request } from '../utils/api'
import { HistoryEntry } from '@/models/history'

type SingleTaskResponse = {
  task: Task
}

type TasksResponse = {
  tasks: Task[]
}

type TaskHistoryResponse = {
  history: HistoryEntry[]
}

export const GetTasks = async (): Promise<TasksResponse> =>
  await Request<TasksResponse>(`/tasks/`)

export const GetTaskByID = async (id: string): Promise<SingleTaskResponse> =>
    await Request<SingleTaskResponse>(`/tasks/${id}`)

export const MarkTaskComplete = async (id: string): Promise<SingleTaskResponse> =>
    await Request<SingleTaskResponse>(`/tasks/${id}/do`, 'POST')

export const SkipTask = async (id: string): Promise<SingleTaskResponse> =>
    await Request<SingleTaskResponse>(`/tasks/${id}/skip`, 'POST')

export const CreateTask = async (task: Omit<Task, 'id'>) =>
  await Request<void>(`/tasks/`, 'POST', (task as Task))

export const DeleteTask = async (id: string) =>
  await Request<void>(`/tasks/${id}`, 'DELETE')

export const SaveTask = async (task: Task) =>
  await Request<void>(`/tasks/`, 'PUT', task)

export const GetTaskHistory = async (taskId: string) =>
  await Request<TaskHistoryResponse>(`/tasks/${taskId}/history`)

export const UpdateDueDate = async (
  id: string,
  due_date: string,
): Promise<SingleTaskResponse> =>
  await Request<SingleTaskResponse>(`/tasks/${id}/dueDate`, 'PUT', {
    due_date
  })
