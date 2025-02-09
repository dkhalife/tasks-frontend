import { Task } from '@/models/task'
import { Request } from '../utils/TokenManager'
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

export const GetTasks = async () => await Request<TasksResponse>(`/tasks/`)

export const GetTaskByID = async (id: string) =>
  await Request<SingleTaskResponse>(`/tasks/${id}`)

export const MarkTaskComplete = async (
  id: string,
  completedDate: Date | null,
) => {
  const body: any = {}

  if (completedDate) {
    body.completedDate = completedDate.toISOString()
  }

  return await Request<SingleTaskResponse>(`/tasks/${id}/do`, 'POST', body)
}

export const SkipTask = async (id: string): Promise<any> =>
  await Request<SingleTaskResponse>(`/tasks/${id}/skip`, 'POST')

export const CreateTask = async (task: Task) =>
  await Request<void>(`/tasks/`, 'POST', task)

export const DeleteTask = async (id: string) =>
  await Request<void>(`/tasks/${id}`, 'DELETE')

export const SaveTask = async (task: Task) =>
  await Request<void>(`/tasks/`, 'PUT', task)

export const GetTaskHistory = async (taskId: string) =>
  await Request<TaskHistoryResponse>(`/tasks/${taskId}/history`)

export const UpdateDueDate = async (id: string, dueDate: Date | null) =>
  await Request<SingleTaskResponse>(`/tasks/${id}/dueDate`, 'PUT', {
    dueDate: dueDate ? dueDate.toISOString() : null,
  })
