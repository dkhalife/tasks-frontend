import { QueryClient, QueryClientProvider } from 'react-query'
import React from 'react'

export const QueryContext = ({ children }) => {
  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
