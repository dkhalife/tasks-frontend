import { NavBar } from './views/Navigation/NavBar'
import { useColorScheme } from '@mui/joy'
import { Outlet } from 'react-router-dom'
import { UserContext, UserProfile } from './contexts/UserContext'
import { GetUserProfile } from './utils/Fetcher'
import { isTokenValid } from './utils/TokenManager'
import { apiManager } from './utils/TokenManager'
import React from 'react'
import { ThemeMode } from './constants/theme'

type AppProps = object

interface AppState {
  userProfile: UserProfile | null
}

export class App extends React.Component<AppProps, AppState> {
  constructor(props) {
    super(props)
    apiManager.init()

    this.state = {
      userProfile: null
    }
  }

  private loadUserProfile = () => {
    GetUserProfile()
    .then(res => {
      res.json().then(data => {
        this.setState({
          userProfile: data.res
        })
      })
    })
  }

  private applyTheme = (className: string) => {
    document.getElementById('root')?.classList.add(className)
  }

  private setUserProfile = (userProfile: UserProfile | null) => {
    this.setState({ userProfile })
  }

  private loadTheme = () => {
    const { mode, systemMode } = useColorScheme()
    const value: ThemeMode = JSON.parse(localStorage.getItem('themeMode') ?? "") || mode

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

    return (
      <div className='min-h-screen'>
        <UserContext.Provider value={{ userProfile, setUserProfile }}>
          <NavBar />
          <Outlet />
        </UserContext.Provider>
      </div>
    )
  }
}
