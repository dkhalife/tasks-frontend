import { APIToken } from '@/models/token'
import { ApiTokenScope, Request } from '../utils/api'
import { User } from '@/models/user'
import {
  NotificationTriggerOptions,
  NotificationType,
} from '@/models/notifications'

type SingleTokenResponse = {
  token: APIToken
}

type TokensResponse = {
  tokens: APIToken[]
}

type UserResponse = {
  user: User
}

export const UpdatePassword = async (newPassword: string) =>
  await Request<void>(`/users/change_password`, 'PUT', {
    password: newPassword,
  })

export const GetUserProfile = async () =>
  await Request<UserResponse>(`/users/profile`)

export const UpdateNotificationSettings = async (
  provider: NotificationType,
  triggers: NotificationTriggerOptions,
) =>
  await Request<void>(`/users/notifications`, 'PUT', {
    provider,
    triggers,
  })

export const CreateLongLiveToken = async (
  name: string,
  scopes: ApiTokenScope[],
) =>
  await Request<SingleTokenResponse>(`/users/tokens`, 'POST', {
    name,
    scopes,
  })

export const DeleteLongLiveToken = async (id: string) =>
  await Request<void>(`/users/tokens/${id}`, 'DELETE')

export const GetLongLiveTokens = async () =>
  await Request<TokensResponse>(`/users/tokens`)
