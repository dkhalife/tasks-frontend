import Cookies from 'js-cookie'
import { API_URL } from '../constants/config'
import { RefreshToken } from './Fetcher'

export function Fetch(url, options) {
  if (!isTokenValid()) {
    Cookies.set('ca_redirect', window.location.pathname)
    window.location.href = '/login'
  }

  options = options || {}
  options.headers = { ...options.headers, ...HEADERS() }

  const baseURL = `${API_URL}/api/v1`

  const fullURL = `${baseURL}${url}`
  return fetch(fullURL, options)
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
