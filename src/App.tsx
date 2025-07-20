import { NavBar } from './views/Navigation/NavBar'
import { Outlet } from 'react-router-dom'
import { isTokenValid } from './utils/api'
import React from 'react'
import { WithNavigate } from './utils/navigation'
import { CssBaseline, CssVarsProvider } from '@mui/joy'
import { preloadSounds } from './utils/sound'
import WebSocketManager from './utils/websocket'
import { fetchLabels } from './store/labelsSlice'
import { AppDispatch } from './store/store'
import { connect } from 'react-redux'
import { fetchUser } from './store/userSlice'
import { fetchTokens } from './store/tokensSlice'
import { fetchTasks } from './store/tasksSlice'

type AppProps = {
  fetchLabels: () => Promise<any>
  fetchUser: () => Promise<any>
  fetchTasks: () => Promise<any>
  fetchTokens: () => Promise<any>
} & WithNavigate

class AppImpl extends React.Component<AppProps> {
  componentDidMount(): void {
    if (isTokenValid()) {
      preloadSounds();
      WebSocketManager.getInstance().connect();

      this.props.fetchUser()
      this.props.fetchLabels()
      this.props.fetchTasks()
      this.props.fetchTokens()
    }
  }

  render() {
    const { navigate } = this.props

    return (
      <div style={{ minHeight: '100vh' }}>
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
      </div>
    )
  }
}

const mapStateToProps = () => ({
})

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  fetchUser: () => dispatch(fetchUser()),
  fetchLabels: () => dispatch(fetchLabels()),
  fetchTasks: () => dispatch(fetchTasks()),
  fetchTokens: () => dispatch(fetchTokens()),
})

export const App = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AppImpl)
