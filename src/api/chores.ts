import { Chore } from "@/models/chore"
import { Request } from "../utils/TokenManager"

export const GetChores = async (): Promise<any> => {
  const response = await Request(`/chores/`)
  if (!response.ok) {
    throw new Error('Failed to get chores: ' + response.statusText)
  }

  return response.json()
}

export const GetChoreByID = async (id: string) => {
  const response = await Request(`/chores/${id}`)
  if (!response.ok) {
    throw new Error('Failed to get chore')
  }

  return response.json()
}

export const GetChoreDetailById = async (id: string): Promise<any> => {
  const response = await Request(`/chores/${id}/details`)
  if (!response.ok) {
    throw new Error('Failed to get chore details')
  }

  return response.json()
}

export const MarkChoreComplete = async (id: string, completedDate: Date | null): Promise<any> => {
  const body: any = {}

  if (completedDate) {
    body.completedDate = completedDate.toISOString()
  }

  const response = await Request(`/chores/${id}/do`, 'POST', body)
  if (!response.ok) {
    throw new Error('Failed to mark chore complete')
  }

  return response.json()
}

export const SkipChore = async (id: string): Promise<any> => {
  const response = await Request(`/chores/${id}/skip`, 'POST')
  if (!response.ok) {
    throw new Error('Failed to skip chore')
  }

  return response.json()
}

export const CreateChore = (chore: Chore) => {
  return Request(`/chores/`, 'POST', chore)
}

export const DeleteChore = async (id: string) => {
  const response = await Request(`/chores/${id}`, 'DELETE')
  if (!response.ok) {
    throw new Error('Failed to delete chore')
  }
}

export const SaveChore = (chore: Chore) => {
  return Request(`/chores/`, 'PUT', chore)
}

export const GetChoreHistory = async (choreId: string) => {
  const response = await Request(`/chores/${choreId}/history`)
  return response.json()
}

export const UpdateDueDate = async (id: string, dueDate: Date | null) => {
  const response = await Request(`/chores/${id}/dueDate`, 'PUT', {
    dueDate: dueDate ? dueDate.toISOString() : null,
  })

  if (!response.ok) {
    throw new Error('Failed to update due date')
  }

  return response.json()
}
