import { Request } from "../utils/TokenManager"

export const signUp = async (username: string, password: string, displayName: string, email: string) => {
  const response = await Request('/auth/', 'POST', {
    username,
    password,
    displayName,
    email,
  }, false)

  if (!response.ok) {
    throw new Error('Signup disabled, please contact admin')
  }

  return response.json()
}

export const login = async (username: string, password: string) => {
  const response = await Request('/auth/login', 'POST', {
    username,
    password,
  }, false)

  if (response.ok) {
    return response.json()
  }
 
  if (response.status === 401) {
    throw new Error('Wrong username or password')
  }
  
  throw new Error('An error occurred, please try again')
}

export const ChangePassword = async (verificationCode: string, password: string): Promise<boolean> => {
  const response = await Request(`/auth/password?c=${verificationCode}`, 'POST', {
    password
  }, false)

  return response.ok
}

export const ResetPassword = async (email: string): Promise<boolean> => {
  const response = await Request('/auth/reset', 'POST', {
    email
  }, false)

  return response.ok
}

export const RefreshToken = async () => {
  const response = await Request('/auth/refresh')
  return response.json()
}
