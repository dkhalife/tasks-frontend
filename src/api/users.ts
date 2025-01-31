import { Fetch, HEADERS } from "../utils/TokenManager"

export const UpdatePassword = newPassword => {
  return Fetch(`/users/change_password`, {
    method: 'PUT',
    body: JSON.stringify({ password: newPassword }),
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