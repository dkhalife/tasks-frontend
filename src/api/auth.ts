import { Request } from "../utils/TokenManager"

export const signUp = (username, password, displayName, email) => {
  return Request('/auth/', 'POST', {
    username,
    password,
    displayName,
    email,
  }, false)
}

export const login = (username, password) => {
  return Request('/auth/login', 'POST', {
    username,
    password,
  }, false)
}

export const ChangePassword = (verificationCode, password) => {
  return Request(`/auth/password?c=${verificationCode}`, 'POST', {
    password
  }, false)
}

export const ResetPassword = email => {
  return Request('/auth/reset', 'POST', {
    email
  }, false)
}

export const RefreshToken = () => {
  return Request('/auth/refresh')
}
