import React, { createContext, useState } from 'react'

const AuthenticationContext = createContext({})

export const AuthenticationProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userProfile, setUserProfile] = useState({})
  return (
    <AuthenticationContext.Provider
      value={{ isLoggedIn, setIsLoggedIn, userProfile, setUserProfile }}
    >
      {children}
    </AuthenticationContext.Provider>
  )
}
