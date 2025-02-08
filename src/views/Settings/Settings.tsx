import { UpdatePassword } from '@/api/users'
import { StorageContext } from '@/contexts/StorageContext'
import { Container, Typography, Divider, Box, Button } from '@mui/joy'
import React from 'react'
import { PassowrdChangeModal } from '../Modals/Inputs/PasswordChangeModal'
import { APITokenSettings } from './APITokenSettings'
import { NotificationSetting } from './NotificationSetting'
import { ThemeToggle } from './ThemeToggle'

export class Settings extends React.Component {
  private changePasswordModal = React.createRef<PassowrdChangeModal>()

  private onPasswordChange = async (password: string | null) => {
    if (!password) {
      return
    }

    await UpdatePassword(password)
  }

  render(): React.ReactNode {
    return (
      <Container>
        <div
          className='grid gap-4 py-4'
          id='account'
        >
          <Typography level='h3'>Account Settings</Typography>
          <Divider />
          <Typography level='body-md'>Update your password</Typography>
          <Box>
            <Typography
              level='title-md'
              mb={1}
            >
              Password
            </Typography>
            <Typography
              mb={1}
              level='body-sm'
            ></Typography>
            <Button
              variant='soft'
              onClick={() => {
                this.changePasswordModal.current?.open()
              }}
            >
              Change Password
            </Button>
            <PassowrdChangeModal
              ref={this.changePasswordModal}
              onClose={newPassword => this.onPasswordChange(newPassword)}
            />
          </Box>
        </div>
        <NotificationSetting />
        <APITokenSettings />
        <div className='grid gap-4 py-4'>
          <Typography level='h3'>Theme preferences</Typography>
          <Divider />
          <Typography level='body-md'>
            Choose how the site looks to you. Select a single theme, or sync
            with your system and automatically switch between day and night
            themes.
          </Typography>
          <StorageContext.Consumer>
            {storedState => (
              <ThemeToggle
                themeMode={storedState.themeMode}
                onThemeModeToggle={storedState.setThemeMode}
              />
            )}
          </StorageContext.Consumer>
        </div>
      </Container>
    )
  }
}
