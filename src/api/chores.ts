import { Request } from "../utils/TokenManager"

export const createChore = async (userID) => {
  const response = await Request(`/chores/`, 'POST', {
    createdBy: Number(userID),
  })
  
  return response.json()
}

export const GetChores = async (): Promise<any> => {
  const response = await Request(`/chores/`)
  if (!response.ok) {
    throw new Error('Failed to get chores: ' + response.statusText)
  }

  return response.json()
}

export const GetArchivedChores = () => {
  return Request(`/chores/archived`)
}

export const ArchiveChore = id => {
  return Request(`/chores/${id}/archive`, 'PUT')
}

export const UnArchiveChore = id => {
  return Request(`/chores/${id}/unarchive`, 'PUT')
}

export const GetChoreByID = async (id) => {
  const response = await Request(`/chores/${id}`)
  if (!response.ok) {
    throw new Error('Failed to get chore')
  }

  return response.json()
}

export const GetChoreDetailById = async (id): Promise<any> => {
  const response = await Request(`/chores/${id}/details`)
  if (!response.ok) {
    throw new Error('Failed to get chore details')
  }

  return response.json()
}

export const MarkChoreComplete = async (id, note, completedDate): Promise<any> => {
  const body: any = {
    note,
  }

  if (completedDate) {
    body.completedDate = new Date(completedDate).toISOString()
  }

  const response = await Request(`/chores/${id}/do`, 'POST', body)
  if (!response.ok) {
    throw new Error('Failed to mark chore complete')
  }

  return response.json()
}


export const SkipChore = async (id): Promise<any> => {
  const response = await Request(`/chores/${id}/skip`, 'POST')
  if (!response.ok) {
    throw new Error('Failed to skip chore')
  }

  return response.json()
}

export const UpdateChoreAssignee = (id, assignee) => {
  return Request(`/chores/${id}/assignee`, 'PUT', {
    assignee: Number(assignee)
  })
}

export const CreateChore = chore => {
  return Request(`/chores/`, 'POST', chore)
}

export const DeleteChore = async (id) => {
  const response = await Request(`/chores/${id}`, 'DELETE')
  if (!response.ok) {
    throw new Error('Failed to delete chore')
  }
}

export const SaveChore = chore => {
  return Request(`/chores/`, 'PUT', chore)
}

export const GetChoreHistory = async (choreId) => {
  const response = await Request(`/chores/${choreId}/history`)
  return response.json()
}

export const DeleteChoreHistory = (choreId, id) => {
  return Request(`/chores/${choreId}/history/${id}`, 'DELETE')
}

export const UpdateChoreHistory = (choreId, id, choreHistory) => {
  return Request(`/chores/${choreId}/history/${id}`, 'PUT', choreHistory)
}

export const UpdateDueDate = async (id, dueDate) => {
  const response = await Request(`/chores/${id}/dueDate`, 'PUT', {
    dueDate: dueDate ? new Date(dueDate).toISOString() : null,
  })

  if (!response.ok) {
    throw new Error('Failed to update due date')
  }

  return response.json()
}
  
export const GetChoresHistory = async (limit, includeMembers) => {
  let url = `/chores/history`
  if (!limit) {
    limit = 7
  }

  if (limit) {
    url += `?limit=${limit}`
  }

  if (includeMembers) {
    url += `&members=true`
  }

  const response = await Request(url)
  return response.json()
}
