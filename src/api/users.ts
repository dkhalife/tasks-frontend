import { Request } from "../utils/TokenManager"

export const UpdatePassword = async (newPassword: string): Promise<void> => {
  const response = await Request(`/users/change_password`, 'PUT', {
    password: newPassword,
  })

  if (!response.ok) {
    throw new Error('Failed to update password')
  }
}

export const GetUserProfile = async () => {
  const response = await Request(`/users/profile`)
  if (!response.ok) {
    throw new Error('Failed to get user profile: ' + response.statusText)
  }

  return response.json()
}

export const UpdateUserDetails = userDetails => {
  return Request(`/users`, 'PUT', userDetails)
}

export const UpdateNotificationTarget = notificationTarget => {
  return Request(`/users/targets`, 'PUT', notificationTarget)
}

export const CreateLongLiveToken = async (name: string): Promise<any> => {
  const response = await Request(`/users/tokens`, 'POST', {
    name,
  })

  if (!response.ok) {
    throw new Error('Failed to create token')
  }

  return response.json();
}

export const DeleteLongLiveToken = async (id: string): Promise<void> => {
  const response = await Request(`/users/tokens/${id}`, 'DELETE')

  if (!response.ok) {
    throw new Error('Failed to delete token')
  }
}

export const GetLongLiveTokens = async () => {
  const response = await Request(`/users/tokens`)
  return response.json()
}

export const PutNotificationTarget = (platform, deviceToken) => {
  return Request(`/users/targets`, 'PUT', {
    platform,
    deviceToken
  })
}
