import { API_URL } from "../constants/config"
import { Fetch, HEADERS } from "../utils/TokenManager"

export const UpdatePassword = newPassword => {
  return fetch(`${API_URL}/api/v1/users/change_password`, {
    method: 'PUT',
    headers: HEADERS(),
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