import { UpdatePassword } from '@/api/users'
import { StorageContext } from '@/contexts/StorageContext'
import { Container, Typography, Divider, Box, Button } from '@mui/joy'
import React from 'react'
import { PassowrdChangeModal } from '../Modals/Inputs/PasswordChangeModal'
import { APITokenSettings } from './APITokenSettings'
import { NotificationSetting } from '../Notifications/NotificationSettings'
import { ThemeToggle } from './ThemeToggle'

export class Settings extends React.Component {
  private changePasswordModal = React.createRef<PassowrdChangeModal>()

  private onPasswordChanged = async (password: string | null) => {
    if (!password) {
      return
    }

    await UpdatePassword(password)
  }

  private onChangePassword = () => {
    this.changePasswordModal.current?.open()
  }

  render(): React.ReactNode {
    return (
      <Container sx={{
        paddingBottom: '16px',
      }}>
        <div
          style={{
            display: 'grid',
            gap: '4',
            paddingTop: '4',
            paddingBottom: '4',
          }}
        >
          <Typography level='h3'>Password</Typography>
          <Divider />
          <Box sx={{
            mt: 1,
          }}>
            <Button
              variant='soft'
              onClick={this.onChangePassword}
            >
              Change Password
            </Button>
            <PassowrdChangeModal
              ref={this.changePasswordModal}
              onClose={this.onPasswordChanged}
            />
          </Box>
        </div>
        <NotificationSetting />
        <APITokenSettings />
        <Box sx={{
          mt: 2,
        }}>
          <Typography level='h3'>Theme preferences</Typography>
          <Divider />

          <StorageContext.Consumer>
            {storedState => (
              <ThemeToggle
                themeMode={storedState.themeMode}
                onThemeModeToggle={storedState.setThemeMode}
              />
            )}
          </StorageContext.Consumer>
        </Box>
      </Container>
    )
  }
}
