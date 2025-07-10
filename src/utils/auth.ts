import { Login } from '@/api/auth'
import { NavigationPaths } from './navigation'
import WebSocketManager from './websocket'

export const doLogin = async (
  email: string,
  password: string,
  navigate: (path: string) => void,
) => {
  const data = await Login(email, password)
  localStorage.setItem('ca_token', data.token)
  localStorage.setItem('ca_expiration', data.expiration)
  WebSocketManager.getInstance().connect()

  const redirectUrl = localStorage.getItem('ca_redirect')
  if (redirectUrl) {
    localStorage.removeItem('ca_redirect')
    navigate(redirectUrl)
  } else {
    navigate(NavigationPaths.HomeView())
  }
}
