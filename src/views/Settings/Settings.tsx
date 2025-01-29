import {
  Box,
  Button,
  Container,
  Divider,
  Typography,
} from '@mui/joy'
import { UpdatePassword } from '../../utils/Fetcher'
import { PassowrdChangeModal } from '../Modals/Inputs/PasswordChangeModal'
import { APITokenSettings } from './APITokenSettings'
import { NotificationSetting } from './NotificationSetting'
import { ThemeToggle } from './ThemeToggle'
import React from 'react'
import { StorageContext } from '../../contexts/StorageContext'

type SettingsProps = object

interface SettingsState {
  changePasswordModal: boolean
}

export class Settings extends React.Component<SettingsProps, SettingsState> {
  constructor(props: SettingsProps) {
    super(props)
    this.state = {
      changePasswordModal: false,
    }
  }

  render(): React.ReactNode {
    const { changePasswordModal } = this.state

    return (
      <Container>
        <div className='grid gap-4 py-4' id='account'>
          <Typography level='h3'>Account Settings</Typography>
          <Divider />
          <Typography level='body-md'>Update your password</Typography>
            <Box>
              <Typography level='title-md' mb={1}>
                Password
              </Typography>
              <Typography mb={1} level='body-sm'></Typography>
              <Button
                variant='soft'
                onClick={() => {
                  this.setState({ changePasswordModal: true })
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
                        if (!resp.ok) {
                          console.error('Password change failed')
                        }
                      })
                    }
                    
                    this.setState({ changePasswordModal: false })
                  }}
                />
              ) : null}
          </Box>
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
          <StorageContext.Consumer>
            {storedState => (
              <ThemeToggle themeMode={storedState.themeMode} onThemeModeToggle={storedState.setThemeMode} />
            )}
          </StorageContext.Consumer>
        </div>
      </Container>
    )
  }
}
