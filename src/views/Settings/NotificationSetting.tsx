import { UpdateNotificationTarget } from '@/api/users'
import { Close } from '@mui/icons-material'
import {
  Typography,
  Divider,
  FormControl,
  FormLabel,
  FormHelperText,
  Box,
  Select,
  Button,
  Snackbar,
  IconButton,
  Option,
} from '@mui/joy'
import React from 'react'

type NotificationSettingProps = object

interface NotificationSettingState {
  isSnackbarOpen: boolean
  notificationTarget: number
  error: string
}

export class NotificationSetting extends React.Component<
  NotificationSettingProps,
  NotificationSettingState
> {
  constructor(props: NotificationSettingProps) {
    super(props)

    this.state = {
      isSnackbarOpen: false,
      notificationTarget: -1,
      error: '',
    }
  }

  componentDidMount(): void {
    // TODO: load notification settings?
  }

  private handleSave = async () => {
    this.setState({ error: '' })

    const { notificationTarget } = this.state
    try {
      await UpdateNotificationTarget({
        type: notificationTarget,
      })
      this.setState({
        notificationTarget: notificationTarget,
      })
    } catch (error) {
      this.setState({
        error: `Error while updating notification target: ${(error as Error).message}`,
      })
    }
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
            onChange={(e: any, selected: any) =>
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
