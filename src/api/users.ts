import { Request } from "../utils/TokenManager"

export const UpdatePassword = newPassword => {
  return Request(`/users/change_password`, 'PUT', {
    password: newPassword,
  })
}

export const GetUserProfile = () => {
  return Request(`/users/profile`)
}

export const UpdateUserDetails = userDetails => {
  return Request(`/users`, 'PUT', userDetails)
}

export const UpdateNotificationTarget = notificationTarget => {
  return Request(`/users/targets`, 'PUT', notificationTarget)
}

export const CreateLongLiveToken = name => {
  return Request(`/users/tokens`, 'POST', {
    name,
  })
}
export const DeleteLongLiveToken = id => {
  return Request(`/users/tokens/${id}`, 'DELETE')
}

export const GetLongLiveTokens = () => {
  return Request(`/users/tokens`)
}

export const PutNotificationTarget = (platform, deviceToken) => {
  return Request(`/users/targets`, 'PUT', {
    platform,
    deviceToken
  })
}
