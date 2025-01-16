import { createContext } from 'react'

export interface UserProfile {
}

interface UserProfileState {
  userProfile: UserProfile | null,
  setUserProfile: (userProfile: UserProfile | null) => void,
};

export const UserContext = createContext<UserProfileState>({
  userProfile: null,
  setUserProfile: () => {},
})
