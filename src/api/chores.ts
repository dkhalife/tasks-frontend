import { Request } from "../utils/TokenManager"

export const createChore = userID => {
  return Request(`/chores/`, 'POST', {
    createdBy: Number(userID),
  }).then(response => response.json())
}

export const GetChores = () => {
  return Request(`/chores/`)
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

export const GetChoreByID = id => {
  return Request(`/chores/${id}`)
}

export const GetChoreDetailById = id => {
  return Request(`/chores/${id}/details`)
}

export const MarkChoreComplete = (id, note, completedDate) => {
  let markChoreURL = `/chores/${id}/do`

  const body = {
    note,
  }
  let completedDateFormated = ''
  if (completedDate) {
    completedDateFormated = `?completedDate=${new Date(
      completedDate,
    ).toISOString()}`
    markChoreURL += completedDateFormated
  }

  return Request(markChoreURL, 'POST', body)
}


export const SkipChore = id => {
  return Request(`/chores/${id}/skip`, 'POST')
}

export const UpdateChoreAssignee = (id, assignee) => {
  return Request(`/chores/${id}/assignee`, 'PUT', {
    assignee: Number(assignee)
  })
}

export const CreateChore = chore => {
  return Request(`/chores/`, 'POST', chore)
}

export const DeleteChore = id => {
  return Request(`/chores/${id}`, 'DELETE')
}

export const SaveChore = chore => {
  return Request(`/chores/`, 'PUT', chore)
}

export const GetChoreHistory = choreId => {
  return Request(`/chores/${choreId}/history`)
}

export const DeleteChoreHistory = (choreId, id) => {
  return Request(`/chores/${choreId}/history/${id}`, 'DELETE')
}

export const UpdateChoreHistory = (choreId, id, choreHistory) => {
  return Request(`/chores/${choreId}/history/${id}`, 'PUT', choreHistory)
}

export const UpdateDueDate = (id, dueDate) => {
  return Request(`/chores/${id}/dueDate`, 'PUT', {
    dueDate: dueDate ? new Date(dueDate).toISOString() : null,
  })
}
  
export const GetChoresHistory = async (limit, includeMembers) => {
  let url = `/chores/history`
  if (!limit) limit = 7

  if (limit) {
    url += `?limit=${limit}`
  }
  if (includeMembers) {
    url += `&members=true`
  }
  const resp = await Request(url)
  return resp.json()
}
