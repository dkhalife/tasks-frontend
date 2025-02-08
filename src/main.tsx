import React from 'react'
import ReactDOM from 'react-dom/client'
import { Contexts } from './contexts/Contexts'
import { useRoot } from './utils/dom'

ReactDOM.createRoot(useRoot()).render(
  <React.StrictMode>
    <Contexts />
  </React.StrictMode>,
)
