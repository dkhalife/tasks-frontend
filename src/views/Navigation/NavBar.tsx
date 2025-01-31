import Logo from '../../assets/logo.svg'
import {
  HomeOutlined,
  ListAlt,
  Logout,
  MenuRounded,
  SettingsOutlined,
} from '@mui/icons-material'
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemContent,
  ListItemDecorator,
  Typography,
} from '@mui/joy'
import { version } from '../../../package.json'
import { ThemeToggleButton } from '../Settings/ThemeToggleButton'
import { NavBarLink } from './NavBarLink'
import React from 'react'
import {
  StorageContext,
  StorageContextState,
} from '../../contexts/StorageContext'
import { toggleTheme } from '../../constants/theme'
import { withLocation, withNavigation } from '../../contexts/hooks'
import { Location } from 'react-router-dom'

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
      <nav className='flex gap-2 p-3'>
        <IconButton
          size='sm'
          variant='plain'
          onClick={this.openDrawer}
        >
          <MenuRounded />
        </IconButton>
        <Box
          className='flex items-center gap-2'
          onClick={() => {
            this.props.navigate('/my/chores')
          }}
        >
          <img
            src={Logo}
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
            {({ themeMode }: StorageContextState) => (
              <ThemeToggleButton
                themeMode={themeMode}
                onThemeModeToggle={toggleTheme}
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
                to='/my/chores'
                icon={<HomeOutlined />}
                label='Home'
              />
              <NavBarLink
                to='/chores'
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

export const NavBar = withNavigation(withLocation(NavBarInner))
