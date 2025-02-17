import { NavBar } from './views/Navigation/NavBar'
import { useColorScheme } from '@mui/joy'
import { Outlet } from 'react-router-dom'
import { UserContext } from './contexts/UserContext'
import { isTokenValid } from './utils/TokenManager'
import React from 'react'
import { ThemeMode } from './constants/theme'
import { GetUserProfile } from './api/users'
import { User } from './models/user'
import { useRoot } from './utils/dom'
import { WithNavigate } from './utils/navigation'

type AppProps = WithNavigate

interface AppState {
  userProfile: User | null
}

export class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)

    this.state = {
      userProfile: null,
    }
  }

  private loadUserProfile = async () => {
    const data = await GetUserProfile()
    this.setState({
      userProfile: data.user,
    })
  }

  private applyTheme = (className: string) => {
    useRoot().classList.add(className)
  }

  private setUserProfile = (userProfile: User | null) => {
    this.setState({ userProfile })
  }

  private loadTheme = () => {
    const { mode, systemMode } = useColorScheme()
    const value: ThemeMode =
      JSON.parse(localStorage.getItem('themeMode') ?? '') || mode

    switch (value) {
      default:
      case 'system':
        if (systemMode === 'dark') {
          this.applyTheme('dark')
        }
        break

      case 'light':
        this.applyTheme('light')
        break

      case 'dark':
        this.applyTheme('dark')
        break
    }
  }

  componentDidMount(): void {
    if (isTokenValid()) {
      this.loadUserProfile()
    }
  }

  render() {
    const { userProfile } = this.state
    const { setUserProfile } = this
    const { navigate } = this.props

    return (
      <div style={{ minHeight: '100vh' }}>
        <UserContext.Provider value={{ userProfile, setUserProfile }}>
          <NavBar navigate={navigate} />
          <Outlet />
        </UserContext.Provider>
      </div>
    )
  }
}
