import { RefreshToken } from '@/api/auth'
import Cookies from 'js-cookie'

const API_URL = import.meta.env.VITE_API_URL;

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

type FailureResponse = {
  error: string
}

let isRefreshingAccessToken = false
const isTokenNearExpiration = () => {
  const now = new Date()
  const expiration = localStorage.getItem('ca_expiration') || ''
  const expire = new Date(expiration)
  return now.getTime() + 24 * 60 * 60 * 1000 > expire.getTime()
}

export const isTokenValid = () => {
  if (localStorage.getItem('ca_token')) {
    const now = new Date()
    const expiration = localStorage.getItem('ca_expiration') || ''
    const expire = new Date(expiration)
    if (now < expire) {
      return true
    } else {
      localStorage.removeItem('ca_token')
      localStorage.removeItem('ca_expiration')
    }
    return false
  }
}

export const refreshAccessToken = async () => {
  isRefreshingAccessToken = true
  const data = await RefreshToken()
  localStorage.setItem('ca_token', data.token)
  localStorage.setItem('ca_expiration', data.expiration)
  isRefreshingAccessToken = false
}

export async function Request<SuccessfulResponse>(
  url: string,
  method: RequestMethod = 'GET',
  body: unknown = {},
  requiresAuth: boolean = true,
): Promise<SuccessfulResponse> {
  if (isTokenValid()) {
    if (!isRefreshingAccessToken && isTokenNearExpiration()) {
      await refreshAccessToken()
    }
  } else if (requiresAuth) {
    Cookies.set('ca_redirect', window.location.pathname)
    window.location.href = '/login'
    // TODO: Stop execution when better type safety is in place
  }

  const fullURL = `${API_URL}/api/v1${url}`

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (requiresAuth) {
    headers['Authorization'] = 'Bearer ' + localStorage.getItem('ca_token')
  }

  const options: RequestInit = {
    method,
    headers,
  }

  if (method != 'GET') {
    options.body = JSON.stringify(body)
  }

  const response: Response = await fetch(fullURL, options)
  const data = await response.json()

  if (!response.ok) {
    throw new Error((data as FailureResponse).error)
  }

  return data as SuccessfulResponse
}
