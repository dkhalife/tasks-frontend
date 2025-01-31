import { Fetch } from "../utils/TokenManager"

export const UpdatePassword = newPassword => {
  return Fetch(`/users/change_password`, {
    method: 'PUT',
    body: JSON.stringify({ password: newPassword }),
  })
}

export const GetUserProfile = () => {
  return Fetch(`/users/profile`)
}

export const UpdateUserDetails = userDetails => {
  return Fetch(`/users`, {
    method: 'PUT',
    body: JSON.stringify(userDetails),
  })
}

export const UpdateNotificationTarget = notificationTarget => {
  return Fetch(`/users/targets`, {
    method: 'PUT',
    body: JSON.stringify(notificationTarget),
  })
}

export const CreateLongLiveToken = name => {
  return Fetch(`/users/tokens`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}
export const DeleteLongLiveToken = id => {
  return Fetch(`/users/tokens/${id}`, {
    method: 'DELETE',
  })
}

export const GetLongLiveTokens = () => {
  return Fetch(`/users/tokens`)
}

export const PutNotificationTarget = (platform, deviceToken) => {
  return Fetch(`/users/targets`, {
    method: 'PUT',
    body: JSON.stringify({ platform, deviceToken }),
  })
}