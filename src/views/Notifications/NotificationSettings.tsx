import {
  Typography,
  Divider,
  Box,
  Select,
  Option,
} from '@mui/joy'
import React from 'react'
import { SelectValue } from '@mui/base/useSelect/useSelect.types'
import { NotificationOptions } from './NotificationOptions'
import { getDefaultTypeForProvider, NotificationProvider, NotificationTriggerOptions, NotificationType } from '@/models/notifications'
import { UpdateNotificationProvider, UpdateNotificationTriggers } from '@/api/users'

type NotificationSettingProps = object

interface NotificationSettingState {
  type: NotificationType
  error: string
  options: NotificationTriggerOptions
}

export class NotificationSetting extends React.Component<
  NotificationSettingProps,
  NotificationSettingState
> {
  constructor(props: NotificationSettingProps) {
    super(props)

    this.state = {
      type: {
        provider: 'none',
      },
      error: '',
      options: {
        pre_due: false,
        due_date: false,
        overdue: false,
        nag: false,
      }
    }
  }

  componentDidMount(): void {
    // TODO: Load settings
  }

  private saveProvider = async (type: NotificationType) => {
    this.setState({ error: '' })

    try {
      await UpdateNotificationProvider(type) 
    } catch {
      this.setState({
        error: 'Could not update notification provider',
      })
    }
  }

  private onNotificationProviderChange = (e: React.MouseEvent | React.KeyboardEvent | React.FocusEvent | null, option: SelectValue<NotificationProvider, false>) => {
    const provider = option as NotificationProvider
    const type = getDefaultTypeForProvider(provider)

    this.setState({
      type,
    })

    this.saveProvider(type)
  }

  private onTriggersChange = (options: NotificationTriggerOptions) => {
    this.setState({
      options,
    })

    this.saveTriggers(options)
  }

  private saveTriggers = async (triggers: NotificationTriggerOptions) => {
    this.setState({ error: '' })

    try {
      await UpdateNotificationTriggers(triggers)
    } catch {
      this.setState({
        error: 'Could not update notification triggers',
      })
    }
  }

  render(): React.ReactNode {
    const { error, type, options } = this.state

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
          <Box>
            <Typography>Choose a provider: </Typography>
            <Select
              value={type.provider}
              sx={{ maxWidth: '200px' }}
              onChange={this.onNotificationProviderChange}
            >
              <Option value={'none'}>None</Option>
              <Option value={'webhook'}>Webhook</Option>
            </Select>
          </Box>

          {type.provider !== 'none' && (
            <NotificationOptions notification={options} onChange={this.onTriggersChange} />
          )}

          {error && (
            <Typography
              color='warning'
              level='body-sm'
            >
              {error}
            </Typography>
          )}
        </Box>
      </Box>
    )
  }
}
