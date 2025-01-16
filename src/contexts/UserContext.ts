import { createContext } from 'react'

interface UserProfileState {
  userProfile: any,
  setUserProfile: (userProfile: any) => void,
};

export const UserContext = createContext<UserProfileState>({
  userProfile: null,
  setUserProfile: () => {},
})
