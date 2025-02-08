import { Request } from '../utils/TokenManager'

type TokenResponse = {
  token: string
  expiration: string
}

export const SignUp = async (
  username: string,
  password: string,
  displayName: string,
  email: string,
) =>
  await Request<void>(
    '/auth/',
    'POST',
    {
      username,
      password,
      displayName,
      email,
    },
    false,
  )

export const Login = async (username: string, password: string) =>
  await Request<TokenResponse>(
    '/auth/login',
    'POST',
    {
      username,
      password,
    },
    false,
  )

export const ChangePassword = async (
  verificationCode: string,
  password: string,
) =>
  await Request<void>(
    `/auth/password?c=${verificationCode}`,
    'POST',
    {
      password,
    },
    false,
  )

export const ResetPassword = async (email: string) =>
  await Request<void>(
    '/auth/reset',
    'POST',
    {
      email,
    },
    false,
  )

export const RefreshToken = async () =>
  await Request<TokenResponse>('/auth/refresh')
