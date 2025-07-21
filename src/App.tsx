import { NavBar } from './views/Navigation/NavBar'
import { Outlet } from 'react-router-dom'
import { isTokenValid } from './utils/api'
import React from 'react'
import { WithNavigate } from './utils/navigation'
import { CssBaseline, CssVarsProvider } from '@mui/joy'
import { preloadSounds } from './utils/sound'
import { SyncManager } from './utils/sync'

type AppProps = {
  fetchLabels: () => Promise<any>
  fetchUser: () => Promise<any>
  fetchTasks: () => Promise<any>
  initGroups: () => void
  fetchTokens: () => Promise<any>
} & WithNavigate

export class App extends React.Component<AppProps> {
  async componentDidMount(): Promise<void> {
    preloadSounds();

    if (isTokenValid()) {
      SyncManager.getInstance().startSync();
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
