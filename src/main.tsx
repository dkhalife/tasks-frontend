import React from 'react'
import ReactDOM from 'react-dom/client'
import { useRoot } from './utils/dom'
import { RouterContext } from './contexts/RouterContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { LogError, LogWarning } from './api/log'

window.onerror = (message, source, lineno, colno) => {
  try {
    LogError(`${source}:${lineno}:${colno} ${message}`, window.location.pathname)
  } catch {
    console.debug('Fatal error: ', message, source, lineno, colno)
  }

  return true
}

window.onunhandledrejection = async (event) => {
  event.preventDefault()
  event.stopImmediatePropagation()

  try {
    await LogWarning(event.reason, window.location.pathname)
  } catch {
    console.debug('Fatal error: ', event.reason)
  }
}

ReactDOM.createRoot(useRoot()).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RouterContext />
    </ErrorBoundary>
  </React.StrictMode>,
)
