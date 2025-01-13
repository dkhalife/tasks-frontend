import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Input,
  Typography,
} from '@mui/joy'
import moment from 'moment'
import { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../contexts/UserContext'
import Logo from '../../Logo'
import { GetUserProfile, UpdatePassword } from '../../utils/Fetcher'
import PassowrdChangeModal from '../Modals/Inputs/PasswordChangeModal'
import APITokenSettings from './APITokenSettings'
import NotificationSetting from './NotificationSetting'
import ThemeToggle from './ThemeToggle'

const Settings = () => {
  const { userProfile, setUserProfile } = useContext(UserContext)
  const [changePasswordModal, setChangePasswordModal] = useState(false)
  useEffect(() => {
    GetUserProfile().then(resp => {
      resp.json().then(data => {
        setUserProfile(data.res)
      })
    })
  }, [])

  if (userProfile === null) {
    return (
      <Container className='flex h-full items-center justify-center'>
        <Box className='flex flex-col items-center justify-center'>
          <CircularProgress
            color='success'
            sx={{ '--CircularProgress-size': '200px' }}
          >
            <Logo />
          </CircularProgress>
        </Box>
      </Container>
    )
  }
  return (
    <Container>
      <div className='grid gap-4 py-4' id='account'>
        <Typography level='h3'>Account Settings</Typography>
        <Divider />
        <Typography level='body-md'>Update your password</Typography>
        {import.meta.env.VITE_IS_SELF_HOSTED === 'true' && (
          <Box>
            <Typography level='title-md' mb={1}>
              Password :
            </Typography>
            <Typography mb={1} level='body-sm'></Typography>
            <Button
              variant='soft'
              onClick={() => {
                setChangePasswordModal(true)
              }}
            >
              Change Password
            </Button>
            {changePasswordModal ? (
              <PassowrdChangeModal
                isOpen={changePasswordModal}
                onClose={password => {
                  if (password) {
                    UpdatePassword(password).then(resp => {
                      if (resp.ok) {
                        alert('Password changed successfully')
                      } else {
                        alert('Password change failed')
                      }
                    })
                  }
                  setChangePasswordModal(false)
                }}
              />
            ) : null}
          </Box>
        )}
      </div>
      <NotificationSetting />
      <APITokenSettings />
      <div className='grid gap-4 py-4'>
        <Typography level='h3'>Theme preferences</Typography>
        <Divider />
        <Typography level='body-md'>
          Choose how the site looks to you. Select a single theme, or sync with
          your system and automatically switch between day and night themes.
        </Typography>
        <ThemeToggle />
      </div>
    </Container>
  )
}

export default Settings
