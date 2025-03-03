import React from 'react'
import ReactDOM from 'react-dom/client'
import { useRoot } from './utils/dom'
import { RouterContext } from './contexts/RouterContext'

ReactDOM.createRoot(useRoot()).render(
  <React.StrictMode>
    <RouterContext />
  </React.StrictMode>,
)
