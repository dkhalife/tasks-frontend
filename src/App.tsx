import { NavBar } from './views/Navigation/NavBar'
import { Outlet } from 'react-router-dom'
import { UserContext } from './contexts/UserContext'
import { isTokenValid } from './utils/api'
import React from 'react'
import { GetUserProfile } from './api/users'
import { User } from './models/user'
import { WithNavigate } from './utils/navigation'
import { CssBaseline, CssVarsProvider } from '@mui/joy'

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

  private setUserProfile = (userProfile: User | null) => {
    this.setState({ userProfile })
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
          <CssBaseline />
          <CssVarsProvider
            modeStorageKey='themeMode'
            attribute='data-theme'
            defaultMode='system'
            colorSchemeNode={document.body}
          >
            <NavBar navigate={navigate} />
            <Outlet />
          </CssVarsProvider>
        </UserContext.Provider>
      </div>
    )
  }
}
