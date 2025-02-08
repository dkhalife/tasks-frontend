import { User } from '@/models/user'
import { createContext } from 'react'

interface UserProfileState {
  userProfile: User | null
  setUserProfile: (userProfile: User | null) => void
}

export const UserContext = createContext<UserProfileState>({
  userProfile: null,
  setUserProfile: () => {},
})
