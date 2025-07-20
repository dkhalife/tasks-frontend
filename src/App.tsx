import { NavBar } from './views/Navigation/NavBar'
import { Outlet } from 'react-router-dom'
import { UserContext } from './contexts/UserContext'
import { isTokenValid } from './utils/api'
import React from 'react'
import { GetUserProfile } from './api/users'
import { User } from './models/user'
import { WithNavigate } from './utils/navigation'
import { CssBaseline, CssVarsProvider } from '@mui/joy'
import { preloadSounds } from './utils/sound'
import WebSocketManager from './utils/websocket'
import { fetchLabels } from './store/labelsSlice'

interface AppState {
  userProfile: User | null
}

import { AppDispatch } from './store/store'
import { connect } from 'react-redux'

type AppProps = {
  fetchLabels: () => Promise<any>
} & WithNavigate

class AppImpl extends React.Component<AppProps> {
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
      preloadSounds();
      WebSocketManager.getInstance().connect();

      this.props.fetchLabels()
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

const mapStateToProps = () => ({
})

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  fetchLabels: () => dispatch(fetchLabels()),
})

export const App = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AppImpl)
