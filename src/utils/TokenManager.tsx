/* eslint-env node */

import { RefreshToken } from "@/api/auth"
import Cookies from 'js-cookie'

const API_URL = import.meta.env.VITE_APP_API_URL

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

type FailureResponse = {
  error: string
}

export async function Request<SuccessfulResponse>(url: string, method: RequestMethod = 'GET', body: unknown = {}, requiresAuth: boolean = true): Promise<SuccessfulResponse>{
  if (!isTokenValid()) {
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

export const isTokenValid = () => {
  if (localStorage.getItem('ca_token')) {
    const now = new Date()
    const expiration = localStorage.getItem('ca_expiration') || ''
    const expire = new Date(expiration)
    if (now < expire) {
      if (now.getTime() + 24 * 60 * 60 * 1000 > expire.getTime()) {
        refreshAccessToken()
      }

      return true
    } else {
      localStorage.removeItem('ca_token')
      localStorage.removeItem('ca_expiration')
    }
    return false
  }
}

export const refreshAccessToken = async () => {
  const data = await RefreshToken()
  localStorage.setItem('ca_token', data.token)
  localStorage.setItem('ca_expiration', data.expiration)
}
