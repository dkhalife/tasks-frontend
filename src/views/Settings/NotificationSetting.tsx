import { UpdateNotificationType } from '@/api/users'
import { Close } from '@mui/icons-material'
import {
  Typography,
  Divider,
  Box,
  Select,
  Snackbar,
  IconButton,
  Option,
} from '@mui/joy'
import React from 'react'
import { SelectValue } from '@mui/base/useSelect/useSelect.types'

type NotificationSettingProps = object

interface NotificationSettingState {
  isSnackbarOpen: boolean
  type: number
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
      type: 0,
      error: '',
    }
  }

  componentDidMount(): void {
    // TODO: load notification settings?
  }

  private handleSave = async () => {
    this.setState({ error: '' })

    const { type } = this.state
    try {
      await UpdateNotificationType(type)
      this.setState({
        type,
      })
    } catch (error) {
      this.setState({
        error: `Error while updating notification target: ${(error as Error).message}`,
      })
    }
  }

  private onNotificationTypeChange = (e: React.MouseEvent | React.KeyboardEvent | React.FocusEvent | null, option: SelectValue<number, false>) => {
    this.setState({
      type: option ?? 0
    })

    this.handleSave()
  }

  private onSnackbarClose = () => {
    this.setState({ isSnackbarOpen: false })
  }

  render(): React.ReactNode {
    const { isSnackbarOpen, error, type } = this.state

    return (
      <Box sx={{ mt: 2 }}>
        <Typography level='h3'>Custom Notification</Typography>
        <Divider />

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mt: 1,
          }}
        >
          <Select
            value={type}
            sx={{ maxWidth: '200px' }}
            onChange={this.onNotificationTypeChange}
          >
            <Option value={0}>None</Option>
            <Option value={3}>Mqtt</Option>
          </Select>
          {error && (
            <Typography
              color='warning'
              level='body-sm'
            >
              {error}
            </Typography>
          )}
        </Box>
        <Snackbar
          open={isSnackbarOpen}
          autoHideDuration={8000}
          onClose={this.onSnackbarClose}
          endDecorator={
            <IconButton
              size='md'
              onClick={this.onSnackbarClose}
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
      </Box>
    )
  }
}
