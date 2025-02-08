import { getNextThemeMode } from '@/constants/theme'
import { withNavigation, withLocation } from '@/contexts/hooks'
import { StorageContext, StorageContextState } from '@/contexts/StorageContext'
import {
  MenuRounded,
  HomeOutlined,
  ListAlt,
  SettingsOutlined,
  Logout,
} from '@mui/icons-material'
import {
  IconButton,
  Box,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemDecorator,
  ListItemContent,
} from '@mui/joy'
import React, { version } from 'react'
import { Location } from 'react-router-dom'
import { ThemeToggleButton } from '../Settings/ThemeToggleButton'
import { NavBarLink } from './NavBarLink'

type NavBarProps = {
  location: Location
  navigate: (path: string) => void
}

interface NavBarState {
  drawerOpen: boolean
}

export class NavBarInner extends React.Component<NavBarProps, NavBarState> {
  constructor(props: NavBarProps) {
    super(props)
    this.state = {
      drawerOpen: false,
    }
  }

  private openDrawer = () => {
    this.setState({ drawerOpen: true })
  }

  private closeDrawer = () => {
    this.setState({ drawerOpen: false })
  }

  render(): React.ReactNode {
    if (
      ['/signup', '/login', '/forgot-password'].includes(
        this.props.location.pathname,
      )
    ) {
      return null
    }

    return (
      <nav
        style={{
          display: 'flex',
          gap: 2,
          padding: '3px',
        }}
      >
        <IconButton
          size='sm'
          variant='plain'
          onClick={this.openDrawer}
        >
          <MenuRounded />
        </IconButton>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
          onClick={() => {
            this.props.navigate('/my/tasks')
          }}
        >
          <img
            alt='DoneTick'
            src={'./logo'}
            width='34'
          />
          <Typography
            level='title-lg'
            sx={{
              fontWeight: 700,
              fontSize: 24,
            }}
          >
            Done
            <span
              style={{
                color: '#06b6d4',
                fontWeight: 600,
              }}
            >
              tick✓
            </span>
          </Typography>
          <StorageContext.Consumer>
            {({ themeMode, setThemeMode }: StorageContextState) => (
              <ThemeToggleButton
                themeMode={themeMode}
                onThemeModeToggle={() =>
                  setThemeMode(getNextThemeMode(themeMode))
                }
                sx={{
                  position: 'absolute',
                  right: 10,
                }}
              />
            )}
          </StorageContext.Consumer>
        </Box>
        <Drawer
          open={this.state.drawerOpen}
          onClick={this.closeDrawer}
          onClose={this.closeDrawer}
          size='sm'
        >
          <div>
            <List
              size='md'
              onClick={this.openDrawer}
              sx={{ borderRadius: 4, width: '100%', padding: 1 }}
            >
              <NavBarLink
                to='/my/tasks'
                icon={<HomeOutlined />}
                label='Home'
              />
              <NavBarLink
                to='/tasks'
                icon={<ListAlt />}
                label='Desktop View'
              />
              <NavBarLink
                to='/labels'
                icon={<ListAlt />}
                label='Labels'
              />
              <NavBarLink
                to='/settings'
                icon={<SettingsOutlined />}
                label='Settings'
              />
            </List>
          </div>
          <div>
            <List
              sx={{
                p: 2,
                height: 'min-content',
                position: 'absolute',
                bottom: 0,
                borderRadius: 4,
                width: '100%',
                padding: 2,
              }}
              size='md'
              onClick={this.openDrawer}
            >
              <ListItemButton
                onClick={() => {
                  localStorage.removeItem('ca_token')
                  localStorage.removeItem('ca_expiration')
                  window.location.href = '/login'
                }}
                sx={{
                  py: 1.2,
                }}
              >
                <ListItemDecorator>
                  <Logout />
                </ListItemDecorator>
                <ListItemContent>Logout</ListItemContent>
              </ListItemButton>
              <Typography
                onClick={() => window.location.reload()}
                level='body-xs'
                sx={{
                  p: 1,
                  color: 'text.tertiary',
                  textAlign: 'center',
                  bottom: 0,
                }}
              >
                V{version}
              </Typography>
            </List>
          </div>
        </Drawer>
      </nav>
    )
  }
}

export const NavBar = withNavigation(withLocation<NavBarProps>(NavBarInner))
