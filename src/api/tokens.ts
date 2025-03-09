import { APIToken, ApiTokenScope } from '@/models/token'
import { Request } from '@/utils/api'

type MarshalledAPIToken = Omit<APIToken, 'expires_at'> & {
  expires_at: string
}

export type SingleAPITokenResponse = {
  token: APIToken
}

type SingleMarshalledAPITokenResponse = {
  token: MarshalledAPIToken
}

type MarshalledTokensResponse = {
  tokens: MarshalledAPIToken[]
}

export type TokensResponse = {
  tokens: APIToken[]
}

const UnmarshallAPIToken = (token: MarshalledAPIToken): APIToken => {
  return {
    ...token,
    expires_at: new Date(token.expires_at),
  }
}

const UnmarshallSingleAPITokenResponse = (
  response: SingleMarshalledAPITokenResponse,
): SingleAPITokenResponse => {
  return {
    token: UnmarshallAPIToken(response.token),
  }
}

const UnmarshallTokensResponse = (
  response: MarshalledTokensResponse,
): TokensResponse => {
  return {
    tokens: response.tokens.map(UnmarshallAPIToken),
  }
}

export const CreateLongLiveToken = async (
  name: string,
  scopes: ApiTokenScope[],
  expiration: number,
) =>
  await UnmarshallSingleAPITokenResponse(
    await Request<SingleMarshalledAPITokenResponse>(`/users/tokens`, 'POST', {
      name,
      scopes,
      expiration,
    })
  )

export const DeleteLongLiveToken = async (id: string) =>
  await Request<void>(`/users/tokens/${id}`, 'DELETE')

export const GetLongLiveTokens = async () =>
  await UnmarshallTokensResponse(
    await Request<MarshalledTokensResponse>(`/users/tokens`)
  )
