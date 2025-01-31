import { Fetch, HEADERS } from "../utils/TokenManager"

export const createChore = userID => {
  return Fetch(`/chores/`, {
    method: 'POST',
    headers: HEADERS(),
    body: JSON.stringify({
      createdBy: Number(userID),
    }),
  }).then(response => response.json())
}

export const GetChores = () => {
  return Fetch(`/chores/`, {
    method: 'GET',
    headers: HEADERS(),
  })
}

export const GetArchivedChores = () => {
  return Fetch(`/chores/archived`, {
    method: 'GET',
    headers: HEADERS(),
  })
}

export const ArchiveChore = id => {
  return Fetch(`/chores/${id}/archive`, {
    method: 'PUT',
    headers: HEADERS(),
  })
}

export const UnArchiveChore = id => {
  return Fetch(`/chores/${id}/unarchive`, {
    method: 'PUT',
    headers: HEADERS(),
  })
}

export const GetChoreByID = id => {
  return Fetch(`/chores/${id}`, {
    method: 'GET',
    headers: HEADERS(),
  })
}

export const GetChoreDetailById = id => {
  return Fetch(`/chores/${id}/details`, {
    method: 'GET',
    headers: HEADERS(),
  })
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

  return Fetch(markChoreURL, {
    method: 'POST',
    headers: HEADERS(),
    body: JSON.stringify(body),
  })
}


export const SkipChore = id => {
  return Fetch(`/chores/${id}/skip`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  })
}

export const UpdateChoreAssignee = (id, assignee) => {
  return Fetch(`/chores/${id}/assignee`, {
    method: 'PUT',
    headers: HEADERS(),
    body: JSON.stringify({ assignee: Number(assignee) }),
  })
}

export const CreateChore = chore => {
  return Fetch(`/chores/`, {
    method: 'POST',
    headers: HEADERS(),
    body: JSON.stringify(chore),
  })
}

export const DeleteChore = id => {
  return Fetch(`/chores/${id}`, {
    method: 'DELETE',
    headers: HEADERS(),
  })
}

export const SaveChore = chore => {
  return Fetch(`/chores/`, {
    method: 'PUT',
    headers: HEADERS(),
    body: JSON.stringify(chore),
  })
}

export const GetChoreHistory = choreId => {
  return Fetch(`/chores/${choreId}/history`, {
    method: 'GET',
    headers: HEADERS(),
  })
}

export const DeleteChoreHistory = (choreId, id) => {
  return Fetch(`/chores/${choreId}/history/${id}`, {
    method: 'DELETE',
    headers: HEADERS(),
  })
}

export const UpdateChoreHistory = (choreId, id, choreHistory) => {
  return Fetch(`/chores/${choreId}/history/${id}`, {
    method: 'PUT',
    headers: HEADERS(),
    body: JSON.stringify(choreHistory),
  })
}

export const UpdateDueDate = (id, dueDate) => {
    return Fetch(`/chores/${id}/dueDate`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      }),
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
    const resp = await Fetch(url, {
      method: 'GET',
      headers: HEADERS(),
    })
    return resp.json()
  }
  