import Cookies from 'js-cookie'
import { API_URL } from '../constants/config'

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export function Fetch(url: string, method: RequestMethod = 'GET', body: unknown = {}): Promise<Response>{
  if (!isTokenValid()) {
    Cookies.set('ca_redirect', window.location.pathname)
    window.location.href = '/login'
    // TODO: Stop execution when better type safety is in place
  }

  const fullURL = `${API_URL}/api/v1${url}`
  return fetch(fullURL, {
    method,
    headers: HEADERS(),
    body: JSON.stringify(body),
  })
}

export const HEADERS = () => {
  return {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + localStorage.getItem('ca_token'),
  }
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

export const refreshAccessToken = () => {
  RefreshToken().then(res => {
    if (res.status === 200) {
      res.json().then(data => {
        localStorage.setItem('ca_token', data.token)
        localStorage.setItem('ca_expiration', data.expire)
      })
    } else {
      return res.json()
    }
  })
}
