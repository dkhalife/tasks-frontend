import { APIToken, ApiTokenScope } from '@/models/token'
import { Request } from '@/utils/api'
export type SingleTokenResponse = {
  token: APIToken
}

export type TokensResponse = {
  tokens: APIToken[]
}

export const CreateLongLiveToken = async (
  name: string,
  scopes: ApiTokenScope[],
  expiration: number,
) =>
  await Request<SingleTokenResponse>(`/users/tokens`, 'POST', {
    name,
    scopes,
    expiration,
  })

export const DeleteLongLiveToken = async (id: string) =>
  await Request<void>(`/users/tokens/${id}`, 'DELETE')

export const GetLongLiveTokens = async () =>
  await Request<TokensResponse>(`/users/tokens`)
