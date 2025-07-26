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
import { StatusList } from './components/StatusList'
import { fetchTasks, initGroups } from './store/tasksSlice'

type AppProps = {
  fetchLabels: () => Promise<any>
  fetchUser: () => Promise<any>
  fetchTasks: () => Promise<any>
  initGroups: () => void
  fetchTokens: () => Promise<any>
} & WithNavigate

class AppImpl extends React.Component<AppProps> {
  async componentDidMount(): Promise<void> {
    if (isTokenValid()) {
      preloadSounds();
      WebSocketManager.getInstance().connect();

      await this.props.fetchUser()
      await this.props.fetchLabels()
      await this.props.fetchTasks()
      await this.props.fetchTokens()
      await this.props.initGroups()
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
          <StatusList />
        </CssVarsProvider>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  fetchUser: () => dispatch(fetchUser()),
  fetchLabels: () => dispatch(fetchLabels()),
  fetchTasks: () => dispatch(fetchTasks()),
  initGroups: () => dispatch(initGroups()),
  fetchTokens: () => dispatch(fetchTokens()),
})

export const App = connect(
  null,
  mapDispatchToProps,
)(AppImpl)
