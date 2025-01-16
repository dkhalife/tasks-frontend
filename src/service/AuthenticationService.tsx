import React, { createContext } from 'react'

interface AuthenticationContext {
  isLoggedIn: boolean
  setIsLoggedIn: (isLoggedIn: boolean) => void
  userProfile: any
  setUserProfile: (userProfile: any) => void
}

interface AuthenticationProviderProps {
  children: React.ReactNode;
}

export class AuthenticationProvider extends React.Component<AuthenticationProviderProps> {
  private authContext = createContext<AuthenticationContext>({
    isLoggedIn: false,
    setIsLoggedIn: () => {},
    userProfile: null,
    setUserProfile: () => {},
  })

  render() {
    const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false)
    const [userProfile, setUserProfile] = React.useState<any>(null)

    return (
      <this.authContext.Provider
        value={{
          isLoggedIn,
          setIsLoggedIn,
          userProfile,
          setUserProfile
        }}
      >
        {this.props.children}
      </this.authContext.Provider>
    )
  }
}
