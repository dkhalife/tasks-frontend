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
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { version } from '../../../package.json'
import { ThemeToggleButton } from '../Settings/ThemeToggleButton'
import { NavBarLink } from './NavBarLink'
import React from 'react'
const links = [
  {
    to: '/my/chores',
    label: 'Home',
    icon: <HomeOutlined />,
  },
  {
    to: '/chores',
    label: 'Desktop View',
    icon: <ListAlt />,
  },
  {
    to: 'labels',
    label: 'Labels',
    icon: <ListAlt />,
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: <SettingsOutlined />,
  },
]

export const NavBar = () => {
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [openDrawer, closeDrawer] = [
    () => setDrawerOpen(true),
    () => setDrawerOpen(false),
  ]
  const location = useLocation()
  if (['/signup', '/login', '/forgot-password'].includes(location.pathname)) {
    return null
  }

  return (
    <nav className='flex gap-2 p-3'>
      <IconButton size='sm' variant='plain' onClick={() => setDrawerOpen(true)}>
        <MenuRounded />
      </IconButton>
      <Box
        className='flex items-center gap-2'
        onClick={() => {
          navigate('/my/chores')
        }}
      >
        <img src={Logo} width='34' />
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
        <ThemeToggleButton
          sx={{
            position: 'absolute',
            right: 10,
          }}
        />
      </Box>
      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        size='sm'
        onClick={closeDrawer}
      >
        <div>
          <List
            size='md'
            onClick={openDrawer}
            sx={{ borderRadius: 4, width: '100%', padding: 1 }}
          >
            {links.map((link, index) => (
              <NavBarLink key={index} to={link.to} icon={link.icon} label={link.label} />
            ))}
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
            onClick={openDrawer}
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
              onClick={
                () => window.location.reload()
              }
              level='body-xs'
              sx={{
                // p: 2,
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
