import { Fetch, HEADERS, apiManager } from './TokenManager'

export const createChore = userID => {
  return Fetch(`/chores/`, {
    method: 'POST',
    headers: HEADERS(),
    body: JSON.stringify({
      createdBy: Number(userID),
    }),
  }).then(response => response.json())
}

export const signUp = (username, password, displayName, email) => {
  const baseURL = apiManager.getApiURL()
  return fetch(`${baseURL}/auth/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password, displayName, email }),
  })
}

export const UpdatePassword = newPassword => {
  const baseURL = apiManager.getApiURL()
  return fetch(`${baseURL}/users/change_password`, {
    method: 'PUT',
    headers: HEADERS(),
    body: JSON.stringify({ password: newPassword }),
  })
}

export const login = (username, password) => {
  const baseURL = apiManager.getApiURL()
  return fetch(`${baseURL}/auth/login`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export const GetChoresNew = async includeArchived => {
  let url = `/chores/`
  if (includeArchived) {
    url += `?includeArchived=true`
  }

  const resp = await Fetch(url, {
    method: 'GET',
    headers: HEADERS(),
  })
  return resp.json()
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

export const GetUserProfile = () => {
  return Fetch(`/users/profile`, {
    method: 'GET',
    headers: HEADERS(),
  })
}

export const UpdateUserDetails = userDetails => {
  return Fetch(`/users`, {
    method: 'PUT',
    headers: HEADERS(),
    body: JSON.stringify(userDetails),
  })
}

export const UpdateNotificationTarget = notificationTarget => {
  return Fetch(`/users/targets`, {
    method: 'PUT',
    headers: HEADERS(),
    body: JSON.stringify(notificationTarget),
  })
}

export const CreateLongLiveToken = name => {
  return Fetch(`/users/tokens`, {
    method: 'POST',
    headers: HEADERS(),
    body: JSON.stringify({ name }),
  })
}
export const DeleteLongLiveToken = id => {
  return Fetch(`/users/tokens/${id}`, {
    method: 'DELETE',
    headers: HEADERS(),
  })
}

export const GetLongLiveTokens = () => {
  return Fetch(`/users/tokens`, {
    method: 'GET',
    headers: HEADERS(),
  })
}
export const PutNotificationTarget = (platform, deviceToken) => {
  return Fetch(`/users/targets`, {
    method: 'PUT',
    headers: HEADERS(),
    body: JSON.stringify({ platform, deviceToken }),
  })
}
export const CreateLabel = label => {
  return Fetch(`/labels`, {
    method: 'POST',
    headers: HEADERS(),
    body: JSON.stringify(label),
  })
}

export const GetLabels = async () => {
  const resp = await Fetch(`/labels`, {
    method: 'GET',
    headers: HEADERS(),
  })
  return resp.json()
}

export const UpdateLabel = label => {
  return Fetch(`/labels`, {
    method: 'PUT',
    headers: HEADERS(),
    body: JSON.stringify(label),
  })
}
export const DeleteLabel = id => {
  return Fetch(`/labels/${id}`, {
    method: 'DELETE',
    headers: HEADERS(),
  })
}

export const ChangePassword = (verifiticationCode, password) => {
  const baseURL = apiManager.getApiURL()
  return fetch(`${baseURL}/auth/password?c=${verifiticationCode}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password: password }),
  })
}

export const ResetPassword = email => {
  const basedURL = apiManager.getApiURL()
  return fetch(`${basedURL}/auth/reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: email }),
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

export const RefreshToken = () => {
  const basedURL = apiManager.getApiURL()
  return fetch(`${basedURL}/auth/refresh`, {
    method: 'GET',
    headers: HEADERS(),
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
