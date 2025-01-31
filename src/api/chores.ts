import { Fetch } from "../utils/TokenManager"

export const createChore = userID => {
  return Fetch(`/chores/`, {
    method: 'POST',
    body: JSON.stringify({
      createdBy: Number(userID),
    }),
  }).then(response => response.json())
}

export const GetChores = () => {
  return Fetch(`/chores/`, {
    method: 'GET'
  })
}

export const GetArchivedChores = () => {
  return Fetch(`/chores/archived`, {
    method: 'GET'
  })
}

export const ArchiveChore = id => {
  return Fetch(`/chores/${id}/archive`, {
    method: 'PUT'
  })
}

export const UnArchiveChore = id => {
  return Fetch(`/chores/${id}/unarchive`, {
    method: 'PUT'
  })
}

export const GetChoreByID = id => {
  return Fetch(`/chores/${id}`, {
    method: 'GET'
  })
}

export const GetChoreDetailById = id => {
  return Fetch(`/chores/${id}/details`, {
    method: 'GET',
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
    body: JSON.stringify(body),
  })
}


export const SkipChore = id => {
  return Fetch(`/chores/${id}/skip`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export const UpdateChoreAssignee = (id, assignee) => {
  return Fetch(`/chores/${id}/assignee`, {
    method: 'PUT',
    body: JSON.stringify({ assignee: Number(assignee) }),
  })
}

export const CreateChore = chore => {
  return Fetch(`/chores/`, {
    method: 'POST',
    body: JSON.stringify(chore),
  })
}

export const DeleteChore = id => {
  return Fetch(`/chores/${id}`, {
    method: 'DELETE',
  })
}

export const SaveChore = chore => {
  return Fetch(`/chores/`, {
    method: 'PUT',
    body: JSON.stringify(chore),
  })
}

export const GetChoreHistory = choreId => {
  return Fetch(`/chores/${choreId}/history`, {
    method: 'GET',
  })
}

export const DeleteChoreHistory = (choreId, id) => {
  return Fetch(`/chores/${choreId}/history/${id}`, {
    method: 'DELETE',
  })
}

export const UpdateChoreHistory = (choreId, id, choreHistory) => {
  return Fetch(`/chores/${choreId}/history/${id}`, {
    method: 'PUT',
    body: JSON.stringify(choreHistory),
  })
}

export const UpdateDueDate = (id, dueDate) => {
    return Fetch(`/chores/${id}/dueDate`, {
      method: 'PUT',
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
    })
    return resp.json()
  }
  