import {
  Button,
  Input,
  Typography,
  Divider,
  Box,
  Select,
  Option,
  Snackbar,
} from '@mui/joy'
import React from 'react'
import { SelectValue } from '@mui/base/useSelect/useSelect.types'
import { NotificationOptions } from './NotificationOptions'
import { getDefaultTypeForProvider, NotificationProvider, NotificationTriggerOptions, NotificationType, NotificationTypeGotify, NotificationTypeWebhook, WebhookMethod } from '@/models/notifications'
import { GetUserProfile, UpdateNotificationSettings } from '@/api/users'

type NotificationSettingProps = object

interface NotificationSettingState {
  saved: boolean
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
      saved: true,
      type: {
        provider: 'none',
      },
      error: '',
      options: {
        pre_due: false,
        due_date: false,
        overdue: false,
      }
    }
  }

  componentDidMount(): void {
    this.loadSettings()
  }

  private loadSettings = async () => {
    const response = await GetUserProfile()
    const notifications = response.user.notifications
      
    this.setState({
      type: notifications.provider,
      options: notifications.triggers,
    })
  }

  private onNotificationProviderChange = (e: React.MouseEvent | React.KeyboardEvent | React.FocusEvent | null, option: SelectValue<NotificationProvider, false>) => {
    const provider = option as NotificationProvider
    const type = getDefaultTypeForProvider(provider)

    this.setState({
      saved: false,
      type,
    })
  }

  private onWebhookMethodChange = (e: React.MouseEvent | React.KeyboardEvent | React.FocusEvent | null, option: SelectValue<string, false>) => {
    const method = option as WebhookMethod
    const type = this.state.type as NotificationTypeWebhook

    this.setState({
      saved: false,
      type: {
        ...type,
        method,
      }
    })
  }

  private onURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value

    const type = this.state.type as (NotificationTypeWebhook | NotificationTypeGotify)

    this.setState({
      saved: false,
      type: {
        ...type,
        url,
      }
    })
  }

  private onGotifyTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const token = e.target.value

    const type = this.state.type as NotificationTypeGotify

    this.setState({
      saved: false,
      type: {
        ...type,
        token,
      }
    })
  }

  private onTriggersChange = (options: NotificationTriggerOptions) => {
    this.setState({
      saved: false,
      options,
    })
  }

  private save = async () => {
    const { type, options } = this.state
    if (type.provider === 'webhook') {
      const isValidURL = type.url.match(/^https?:\/\/[^\s/$.?#].[^\s]*$/i)
      if (!isValidURL) {
        this.setState({
          error: 'Webhook URL must be a valid URL'
        })

        return
      }
    }

    this.setState({
      error: '',
      saved: true
    })

    try {
      await UpdateNotificationSettings(type, options) 
    } catch {
      this.setState({
        saved: false,
        error: 'Could not update notification settings',
      })
    }
  }

  private onSnackbarClose = () => {
    this.setState({ error: '' })
  }

  render(): React.ReactNode {
    const { error, type, options, saved } = this.state

    const placeholderURL = type.provider === 'webhook' ? 'https://example.com/api/webhook/mmbd7gtpoxp' : 'https://mygotifyendpoint.com/'

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
              <Option value={'gotify'}>Gotify</Option>
            </Select>
          </Box>

          {type.provider === 'webhook' && (
            <Box>
              <Typography>Method: </Typography>
              <Select
                value={type.method}
                sx={{ maxWidth: '200px' }}
                onChange={this.onWebhookMethodChange}
                >
                <Option value={'GET'}>GET</Option>
                <Option value={'POST'}>POST</Option>
              </Select>
            </Box>
          )}

          {(type.provider === 'webhook' || type.provider === 'gotify') && (
            <Box>
              <Typography>Webhook URL: </Typography>
              <Input placeholder={placeholderURL} value={type.url} onChange={this.onURLChange} />
            </Box>
          )}

          {type.provider === 'gotify' && (
            <Box>
              <Typography>Token: </Typography>
              <Input type='password' placeholder='Your Gotify token' value={type.token} onChange={this.onGotifyTokenChange} />
            </Box>
          )}

          {type.provider !== 'none' && (
            <NotificationOptions notification={options} onChange={this.onTriggersChange} />
          )}

          {!saved && !error && (
            <Box sx={{
              display: 'flex',
              justifyContent: 'flex-start',
            }}>
              <Button onClick={this.save}>Save</Button>
            </Box>
          )}

          <Snackbar
            open={error !== ''}
            onClose={this.onSnackbarClose}
            autoHideDuration={3000}
          >
            {error}
          </Snackbar>
        </Box>
      </Box>
    )
  }
}
