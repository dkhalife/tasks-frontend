import { Fetch } from "../utils/TokenManager"

export const signUp = (username, password, displayName, email) => {
  return Fetch('/auth/', 'POST', {
    username,
    password,
    displayName,
    email,
  }, false)
}

export const login = (username, password) => {
  return Fetch('/auth/login', 'POST', {
    username,
    password,
  }, false)
}

export const ChangePassword = (verificationCode, password) => {
  return Fetch(`/auth/password?c=${verificationCode}`, 'POST', {
    password
  }, false)
}

export const ResetPassword = email => {
  return Fetch('/auth/reset', 'POST', {
    email
  }, false)
}

export const RefreshToken = () => {
  return Fetch('/auth/refresh')
}
