/* eslint-env node */

import Cookies from 'js-cookie'
import { RefreshToken } from '../api/auth'

const API_URL = import.meta.env.VITE_APP_API_URL

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export function Request(url: string, method: RequestMethod = 'GET', body: unknown = {}, requiresAuth: boolean = true): Promise<Response>{
  if (!isTokenValid()) {
    Cookies.set('ca_redirect', window.location.pathname)
    window.location.href = '/login'
    // TODO: Stop execution when better type safety is in place
  }

  const fullURL = `${API_URL}/api/v1${url}`

  const headers = {
    'Content-Type': 'application/json',
  }

  if (requiresAuth) {
    headers['Authorization'] = 'Bearer ' + localStorage.getItem('ca_token')
  }

  return fetch(fullURL, {
    method,
    headers,
    body: JSON.stringify(body),
  })
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
  localStorage.setItem('ca_expiration', data.expire)
}
