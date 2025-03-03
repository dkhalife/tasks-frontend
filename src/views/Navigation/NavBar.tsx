import {
  MenuRounded,
  HomeOutlined,
  LabelOutlined,
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
import React from 'react'
import { ThemeToggleButton } from '../Settings/ThemeToggleButton'
import { NavBarLink } from './NavBarLink'
import { getPathName, NavigationPaths, WithNavigate } from '@/utils/navigation'
import { Logo } from '@/Logo'

type NavBarProps = WithNavigate

interface NavBarState {
  drawerOpen: boolean
}

export class NavBar extends React.Component<NavBarProps, NavBarState> {
  constructor(props: NavBarProps) {
    super(props)
    this.state = {
      drawerOpen: false,
    }
  }

  private version = import.meta.env.PACKAGE_VERSION;

  private openDrawer = () => {
    this.setState({ drawerOpen: true })
  }

  private closeDrawer = () => {
    this.setState({ drawerOpen: false })
  }

  private logout = () => {
    localStorage.removeItem('ca_token')
    localStorage.removeItem('ca_expiration')
    this.props.navigate(NavigationPaths.Login)
  }

  render(): React.ReactNode {
    if (
      ['/signup', '/login', '/forgot-password'].includes(
        getPathName(),
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
        >
          <Logo
            level='title-lg'
            sx={{
              fontWeight: 700,
              fontSize: 24,
            }}
          />
          <ThemeToggleButton
            themeMode={'light'}
            onThemeModeToggle={() => {}}
            sx={{
              position: 'absolute',
              right: 10,
            }}
          />
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
                to={NavigationPaths.DeviceAwareLoggedInLandingPage}
                icon={<HomeOutlined />}
                label='Home'
              />
              <NavBarLink
                to='/labels'
                icon={<LabelOutlined />}
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
                onClick={this.logout}
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
                level='body-xs'
                sx={{
                  p: 1,
                  color: 'text.tertiary',
                  textAlign: 'center',
                  bottom: 0,
                }}
              >
                v{this.version}
              </Typography>
            </List>
          </div>
        </Drawer>
      </nav>
    )
  }
}
