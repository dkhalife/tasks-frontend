import React from 'react'
import ReactDOM from 'react-dom/client'
import { Contexts } from './contexts/Contexts'

ReactDOM.createRoot(document.getElementById('root') as HTMLDivElement).render(
  <React.StrictMode>
    <Contexts />
  </React.StrictMode>,
)
