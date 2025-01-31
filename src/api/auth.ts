import { API_URL } from "../constants/config"
import { HEADERS } from "../utils/TokenManager"

export const signUp = (username, password, displayName, email) => {
  return fetch(`${API_URL}/api/v1/auth/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password, displayName, email }),
  })
}

export const login = (username, password) => {
  return fetch(`${API_URL}/api/v1/auth/login`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export const ChangePassword = (verifiticationCode, password) => {
  return fetch(`${API_URL}/api/v1/auth/password?c=${verifiticationCode}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password: password }),
  })
}

export const ResetPassword = email => {
  return fetch(`${API_URL}/api/v1/auth/reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: email }),
  })
}

export const RefreshToken = () => {
    return fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'GET',
      headers: HEADERS(),
    })
  }
