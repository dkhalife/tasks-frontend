import { getFeatureFlag } from '@/constants/featureFlags'
import { WSRequest } from '@/models/websocket'

const API_URL = import.meta.env.VITE_APP_API_URL

export class WebSocketManager {
  private static instance: WebSocketManager
  private socket: WebSocket | null = null
  private retryCount = 0
  private manualClose = false
  private enabled: boolean

  private constructor() {
    this.enabled = getFeatureFlag('useWebsockets', false)
  }

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager()
    }
    return WebSocketManager.instance
  }

  connect() {
    if (!this.enabled) {
      return
    }
    const token = localStorage.getItem('ca_token')
    if (!token) {
      return
    }

    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return
    }

    this.manualClose = false

    const wsProtocol = API_URL.startsWith('https') ? 'wss' : 'ws'
    const baseUrl = API_URL.replace(/^https?/, wsProtocol)
    const url = `${baseUrl}/ws`

    try {
      this.socket = new WebSocket(url, [wsProtocol, token])
    } catch {
      this.scheduleReconnect()
      return
    }

    this.socket.onopen = () => {
      this.retryCount = 0
    }

    this.socket.onmessage = (event) => {
      console.log('WebSocket message:', event.data)
    }

    this.socket.onclose = () => {
      this.socket = null
      this.scheduleReconnect()
    }

    this.socket.onerror = (event) => {
      console.error('WebSocket error:', event)
    }
  }

  disconnect() {
    this.manualClose = true
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
    this.retryCount = 0
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN
  }

  send(request: WSRequest) {
    if (!this.isConnected() || !this.socket) {
      return
    }
    this.socket.send(JSON.stringify(request))
  }

  private scheduleReconnect() {
    if (this.manualClose || !this.enabled) {
      return
    }

    const delay = Math.min(30000, Math.pow(2, this.retryCount) * 1000)
    this.retryCount += 1
    setTimeout(() => this.connect(), delay)
  }
}

export default WebSocketManager
