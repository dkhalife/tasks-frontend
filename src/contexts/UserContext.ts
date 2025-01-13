import { createContext } from 'react'

export const UserContext = createContext({
  userProfile: null,
  setUserProfile: () => {},
})
