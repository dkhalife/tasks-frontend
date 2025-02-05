import { Task } from "@/models/task"
import { Request } from "../utils/TokenManager"

export const GetTasks = async (): Promise<any> => {
  const response = await Request(`/tasks/`)
  if (!response.ok) {
    throw new Error('Failed to get tasks: ' + response.statusText)
  }

  return response.json()
}

export const GetTaskByID = async (id: string) => {
  const response = await Request(`/tasks/${id}`)
  if (!response.ok) {
    throw new Error('Failed to get task')
  }

  return response.json()
}

export const GetTaskDetailById = async (id: string): Promise<any> => {
  const response = await Request(`/tasks/${id}/details`)
  if (!response.ok) {
    throw new Error('Failed to get task details')
  }

  return response.json()
}

export const MarkTaskComplete = async (id: string, completedDate: Date | null): Promise<any> => {
  const body: any = {}

  if (completedDate) {
    body.completedDate = completedDate.toISOString()
  }

  const response = await Request(`/tasks/${id}/do`, 'POST', body)
  if (!response.ok) {
    throw new Error('Failed to mark task complete')
  }

  return response.json()
}

export const SkipTask = async (id: string): Promise<any> => {
  const response = await Request(`/tasks/${id}/skip`, 'POST')
  if (!response.ok) {
    throw new Error('Failed to skip task')
  }

  return response.json()
}

export const CreateTask = (task: Task) => {
  return Request(`/tasks/`, 'POST', task)
}

export const DeleteTask = async (id: string) => {
  const response = await Request(`/tasks/${id}`, 'DELETE')
  if (!response.ok) {
    throw new Error('Failed to delete task')
  }
}

export const SaveTask = (task: Task) => {
  return Request(`/tasks/`, 'PUT', task)
}

export const GetTaskHistory = async (taskId: string) => {
  const response = await Request(`/tasks/${taskId}/history`)
  return response.json()
}

export const UpdateDueDate = async (id: string, dueDate: Date | null) => {
  const response = await Request(`/tasks/${id}/dueDate`, 'PUT', {
    dueDate: dueDate ? dueDate.toISOString() : null,
  })

  if (!response.ok) {
    throw new Error('Failed to update due date')
  }

  return response.json()
}
