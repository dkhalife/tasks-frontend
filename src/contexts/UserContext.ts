import { createContext } from 'react'

export interface UserProfile {
  userProfile: any,
  setUserProfile: (userProfile: any) => void,
};

export const UserContext = createContext({
  userProfile: null,
  setUserProfile: () => {},
})
