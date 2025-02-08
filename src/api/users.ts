import { APIToken } from "@/models/token"
import { Request } from "../utils/TokenManager"
import { User } from "@/models/user"

type SingleTokenResponse = {
  token: APIToken
}

type TokensResponse = {
  tokens: APIToken[]
}

type UserResponse = {
  user: User
}

export const UpdatePassword = async (newPassword: string) => await Request<void>(`/users/change_password`, 'PUT', {
  password: newPassword,
})

export const GetUserProfile = async () => await Request<UserResponse>(`/users/profile`)

export const UpdateNotificationTarget = async (notificationTarget: any) => await Request<void>(`/users/targets`, 'PUT', notificationTarget)
export const CreateLongLiveToken = async (name: string) => await Request<SingleTokenResponse>(`/users/tokens`, 'POST', {
  name,
})

export const DeleteLongLiveToken = async (id: string) => await Request<void>(`/users/tokens/${id}`, 'DELETE')

export const GetLongLiveTokens = async () => await Request<TokensResponse>(`/users/tokens`)
