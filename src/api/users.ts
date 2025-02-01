import { Fetch } from "../utils/TokenManager"

export const UpdatePassword = newPassword => {
  return Fetch(`/users/change_password`, 'PUT', {
    password: newPassword,
  })
}

export const GetUserProfile = () => {
  return Fetch(`/users/profile`)
}

export const UpdateUserDetails = userDetails => {
  return Fetch(`/users`, 'PUT', userDetails)
}

export const UpdateNotificationTarget = notificationTarget => {
  return Fetch(`/users/targets`, 'PUT', notificationTarget)
}

export const CreateLongLiveToken = name => {
  return Fetch(`/users/tokens`, 'POST', {
    name,
  })
}
export const DeleteLongLiveToken = id => {
  return Fetch(`/users/tokens/${id}`, 'DELETE')
}

export const GetLongLiveTokens = () => {
  return Fetch(`/users/tokens`)
}

export const PutNotificationTarget = (platform, deviceToken) => {
  return Fetch(`/users/targets`, 'PUT', {
    platform,
    deviceToken
  })
}
