import { Close } from '@mui/icons-material'
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Option,
  Select,
  Snackbar,
  Typography,
} from '@mui/joy'
import React from 'react'
import { User } from '../../models/user'
import { GetUserProfile, UpdateNotificationTarget } from '../../api/users'

type NotificationSettingProps = object

interface NotificationSettingState {
  isSnackbarOpen: boolean
  notificationTarget: string | null
  error: string
  userProfile: User | null
}

export class NotificationSetting extends React.Component<
  NotificationSettingProps,
  NotificationSettingState
> {
  constructor(props: NotificationSettingProps) {
    super(props)

    this.state = {
      isSnackbarOpen: false,
      notificationTarget: null,
      error: '',
      userProfile: null,
    }
  }

  componentDidMount(): void {
    GetUserProfile().then(data => {
      this.setState({
        userProfile: data.res,
      })
    })
  }

  private handleSave = () => {
    this.setState({ error: '' })

    const { userProfile, notificationTarget } = this.state
    UpdateNotificationTarget({
      type: Number(notificationTarget),
    }).then(resp => {
      if (resp.status != 200) {
        this.setState({
          error: `Error while updating notification target: ${resp.statusText}`,
        })
        return
      }

      this.setState({
        userProfile: {
          ...userProfile,
          notification_target: {
            type: Number(notificationTarget),
          },
        },
      })
    })
  }

  render(): React.ReactNode {
    const { isSnackbarOpen, error, notificationTarget } = this.state

    return (
      <div
        className='grid gap-4 py-4'
        id='notifications'
      >
        <Typography level='h3'>Custom Notification</Typography>
        <Divider />
        <Typography level='body-md'>
          Notificaiton through other platform like Telegram or Pushover
        </Typography>

        <FormControl
          orientation='horizontal'
          sx={{ width: 400, justifyContent: 'space-between' }}
        >
          <div>
            <FormLabel>Custom Notification</FormLabel>
            <FormHelperText sx={{ mt: 0 }}>
              Receive notification on other platform
            </FormHelperText>
          </div>
        </FormControl>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Select
            value={notificationTarget}
            sx={{ maxWidth: '200px' }}
            onChange={(e, selected) =>
              this.setState({ notificationTarget: selected })
            }
          >
            <Option value='0'>None</Option>
            <Option value='3'>Mqtt</Option>
          </Select>
          {error && (
            <Typography
              color='warning'
              level='body-sm'
            >
              {error}
            </Typography>
          )}

          <Button
            sx={{
              width: '110px',
              mb: 1,
            }}
            onClick={this.handleSave}
          >
            Save
          </Button>
        </Box>
        <Snackbar
          open={isSnackbarOpen}
          autoHideDuration={8000}
          onClose={() => this.setState({ isSnackbarOpen: false })}
          endDecorator={
            <IconButton
              size='md'
              onClick={() => this.setState({ isSnackbarOpen: false })}
            >
              <Close />
            </IconButton>
          }
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography level='title-md'>Permission Denied</Typography>
            <Typography level='body-md'>
              You have denied the permission to receive notification on this
              device. Please enable it in your device settings
            </Typography>
          </div>
        </Snackbar>
      </div>
    )
  }
}
