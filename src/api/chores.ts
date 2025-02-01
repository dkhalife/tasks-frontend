import { Fetch } from "../utils/TokenManager"

export const createChore = userID => {
  return Fetch(`/chores/`, 'POST', {
    createdBy: Number(userID),
  }).then(response => response.json())
}

export const GetChores = () => {
  return Fetch(`/chores/`)
}

export const GetArchivedChores = () => {
  return Fetch(`/chores/archived`)
}

export const ArchiveChore = id => {
  return Fetch(`/chores/${id}/archive`, 'PUT')
}

export const UnArchiveChore = id => {
  return Fetch(`/chores/${id}/unarchive`, 'PUT')
}

export const GetChoreByID = id => {
  return Fetch(`/chores/${id}`)
}

export const GetChoreDetailById = id => {
  return Fetch(`/chores/${id}/details`)
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

  return Fetch(markChoreURL, 'POST', body)
}


export const SkipChore = id => {
  return Fetch(`/chores/${id}/skip`, 'POST')
}

export const UpdateChoreAssignee = (id, assignee) => {
  return Fetch(`/chores/${id}/assignee`, 'PUT', {
    assignee: Number(assignee)
  })
}

export const CreateChore = chore => {
  return Fetch(`/chores/`, 'POST', chore)
}

export const DeleteChore = id => {
  return Fetch(`/chores/${id}`, 'DELETE')
}

export const SaveChore = chore => {
  return Fetch(`/chores/`, 'PUT', chore)
}

export const GetChoreHistory = choreId => {
  return Fetch(`/chores/${choreId}/history`)
}

export const DeleteChoreHistory = (choreId, id) => {
  return Fetch(`/chores/${choreId}/history/${id}`, 'DELETE')
}

export const UpdateChoreHistory = (choreId, id, choreHistory) => {
  return Fetch(`/chores/${choreId}/history/${id}`, 'PUT', choreHistory)
}

export const UpdateDueDate = (id, dueDate) => {
  return Fetch(`/chores/${id}/dueDate`, 'PUT', {
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
  const resp = await Fetch(url)
  return resp.json()
}
