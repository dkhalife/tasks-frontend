import { createContext } from 'react'

export type UserProfile = unknown

interface UserProfileState {
  userProfile: UserProfile | null
  setUserProfile: (userProfile: UserProfile | null) => void
}

export const UserContext = createContext<UserProfileState>({
  userProfile: null,
  setUserProfile: () => {},
})
