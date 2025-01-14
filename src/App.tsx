import { NavBar } from './views/components/NavBar'
import { useColorScheme } from '@mui/joy'
import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Outlet } from 'react-router-dom'
import { UserContext } from './contexts/UserContext'
import { AuthenticationProvider } from './service/AuthenticationService'
import { GetUserProfile } from './utils/Fetcher'
import { isTokenValid } from './utils/TokenManager'
import { apiManager } from './utils/TokenManager'
import React from 'react'

const add = className => {
  document.getElementById('root')?.classList.add(className)
}

const remove = className => {
  document.getElementById('root')?.classList.remove(className)
}

export function App() {
  apiManager.init()

  const queryClient = new QueryClient()
  const { mode, systemMode } = useColorScheme()
  const [userProfile, setUserProfile] = useState<any>(null)

  const getUserProfile = () => {
    GetUserProfile()
      .then(res => {
        res.json().then(data => {
          setUserProfile(data.res)
        })
      })
  }
  useEffect(() => {
    const value = JSON.parse(localStorage.getItem('themeMode') ?? "") || mode

    if (value === 'system') {
      if (systemMode === 'dark') {
        return add('dark')
      }
      return remove('dark')
    }

    if (value === 'dark') {
      return add('dark')
    }

    return remove('dark')
  }, [mode, systemMode])

  useEffect(() => {
    if (isTokenValid() && !userProfile) {
      getUserProfile()
    }
  }, [userProfile, getUserProfile, isTokenValid])

  return (
    <div className='min-h-screen'>
      <QueryClientProvider client={queryClient}>
        <AuthenticationProvider />
        <UserContext.Provider value={{ userProfile, setUserProfile }}>
          <NavBar />
          <Outlet />
        </UserContext.Provider>
      </QueryClientProvider>
    </div>
  )
}
