import { getFeatureFlag } from '@/constants/featureFlags'
import { WSEvent, WSRequest, WSResponse } from '@/models/websocket'

const API_URL = import.meta.env.VITE_APP_API_URL

export class WebSocketManager {
  private static instance: WebSocketManager
  private socket: WebSocket | null = null
  private retryCount = 0
  private manualClose = false
  private enabled: boolean
  private listeners: Map<WSEvent, Set<(data: unknown) => void>> = new Map()

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
      let message: WSResponse | null = null
      try {
        message = JSON.parse(event.data)
      } catch {
        console.debug('Unexpected WebSocket message type:', event.data)
      }

      if (message && message.action) {
        this.emit(message.action, message.data)
      }
    }
 
    this.socket.onclose = () => {
      this.socket = null
      this.scheduleReconnect()
    }

    this.socket.onerror = (event) => {
      console.debug('WebSocket error:', event)
    }
  }

  on(action: WSEvent, handler: (data: unknown) => void) {
    if (!this.listeners.has(action)) {
      this.listeners.set(action, new Set())
    }

    this.listeners.get(action)?.add(handler)
  }

  off(action: WSEvent, handler: (data: unknown) => void) {
    const handlers = this.listeners.get(action)
    if (!handlers) {
      return
    }

    handlers.delete(handler)
    if (handlers.size === 0) {
      this.listeners.delete(action)
    }
  }

  async waitFor(
    event: WSEvent,
    condition: (data: unknown) => boolean,
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const handler = (data: unknown) => {
        let result = false
        try {
          result = condition(data)
        } catch (e) {
          console.debug('WebSocket waitFor condition error', e)
        }

        if (result) {
          clearTimeout(timeoutId)
          this.off(event, handler)
          resolve(data)
        }
      }

      const timeoutId = setTimeout(() => {
        this.off(event, handler)
        reject(new Error('Timed out waiting for condition'))
      }, 5000)

      this.on(event, handler)
    })
  }

  private emit(event: WSEvent, data: unknown) {
    const handlers = this.listeners.get(event)
    if (!handlers) {
      return
    }

    handlers.forEach(h => {
      try {
        h(data)
      } catch (e) {
        console.debug('WebSocket listener error', e)
      }
    })
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

  send(request: WSRequest): void {
    if (!this.isConnected()) {
      throw new Error('WebSocket is not connected')
    }

    this.socket!.send(JSON.stringify(request))
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
