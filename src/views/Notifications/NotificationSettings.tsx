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
import {
  getDefaultTypeForProvider,
  NotificationProvider,
  NotificationTriggerOptions,
  NotificationType,
  NotificationTypeGotify,
  NotificationTypeWebhook,
  WebhookMethod,
} from '@/models/notifications'
import WebSocketManager from '@/utils/websocket'
import { RootState, AppDispatch } from '@/store/store'
import { connect } from 'react-redux'
import { updateNotificationSettings } from '@/store/userSlice'

type NotificationSettingProps = {
  initialType: NotificationType
  initialOptions: NotificationTriggerOptions

  updateNotificationSettings: (type: NotificationType, options: NotificationTriggerOptions) => Promise<any>
}

interface NotificationSettingState {
  saved: boolean
  type: NotificationType
  error: string
  options: NotificationTriggerOptions
}

class NotificationSettingsImpl extends React.Component<
  NotificationSettingProps,
  NotificationSettingState
> {
  private ws: WebSocketManager

  constructor(props: NotificationSettingProps) {
    super(props)

    this.ws = WebSocketManager.getInstance()

    this.state = {
      saved: true,
      error: '',
      type: props.initialType,
      options: props.initialOptions,
    }
  }

  // componentDidMount(): void {
  //   this.registerWebSocketListeners()
  // }

  // componentWillUnmount(): void {
  //   this.unregisterWebSocketListeners()
  // }

  // private registerWebSocketListeners = () => {
  //   this.ws.on('notification_settings_updated', this.onNotificationSettingsUpdatedWS);
  // }

  // private unregisterWebSocketListeners = () => {
  //   this.ws.off('notification_settings_updated', this.onNotificationSettingsUpdatedWS);
  // }

  // private onNotificationSettingsUpdatedWS = (data: any) => {
  //   this.setState({
  //     type: data.provider,
  //     options: {
  //       ...data.triggers,
  //     },
  //     saved: true,
  //   })
  // }

  private onNotificationProviderChange = (
    e: React.MouseEvent | React.KeyboardEvent | React.FocusEvent | null,
    option: SelectValue<NotificationProvider, false>,
  ) => {
    const provider = option as NotificationProvider
    const type = getDefaultTypeForProvider(provider)

    this.setState({
      saved: false,
      type,
    })
  }

  private onWebhookMethodChanged = (
    e: React.MouseEvent | React.KeyboardEvent | React.FocusEvent | null,
    option: SelectValue<string, false>,
  ) => {
    const method = option as WebhookMethod
    const type = this.state.type as NotificationTypeWebhook

    this.setState({
      saved: false,
      type: {
        ...type,
        method,
      },
    })
  }

  private onURLChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value

    const type = this.state.type as
      | NotificationTypeWebhook
      | NotificationTypeGotify

    this.setState({
      saved: false,
      type: {
        ...type,
        url,
      },
    })
  }

  private onGotifyTokenChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const token = e.target.value

    const type = this.state.type as NotificationTypeGotify

    this.setState({
      saved: false,
      type: {
        ...type,
        token,
      },
    })
  }

  private onTriggersChanged = (options: NotificationTriggerOptions) => {
    this.setState({
      saved: false,
      options,
    })
  }

  private onSaveClicked = async () => {
    const { type, options } = this.state
    if (type.provider === 'webhook') {
      const isValidURL = type.url.match(/^https?:\/\/[^\s/$.?#].[^\s]*$/i)
      if (!isValidURL) {
        this.setState({
          error: 'Webhook URL must be a valid URL',
        })

        return
      }
    }

    this.setState({
      error: '',
      saved: true,
    })

    try {
      await this.props.updateNotificationSettings(type, options)
    } catch {
      this.setState({
        saved: false,
        error: 'Could not update notification settings',
      })
    }
  }

  private onSnackbarCloseClicked = () => {
    this.setState({ error: '' })
  }

  render(): React.ReactNode {
    const { error, type, options, saved } = this.state

    const placeholderURL =
      type.provider === 'webhook'
        ? 'https://example.com/api/webhook/mmbd7gtpoxp'
        : 'https://mygotifyendpoint.com/'

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
                onChange={this.onWebhookMethodChanged}
              >
                <Option value={'GET'}>GET</Option>
                <Option value={'POST'}>POST</Option>
              </Select>
            </Box>
          )}

          {(type.provider === 'webhook' || type.provider === 'gotify') && (
            <Box>
              <Typography>Webhook URL: </Typography>
              <Input
                placeholder={placeholderURL}
                value={type.url}
                onChange={this.onURLChanged}
              />
            </Box>
          )}

          {type.provider === 'gotify' && (
            <Box>
              <Typography>Token: </Typography>
              <Input
                type='password'
                placeholder='Your Gotify token'
                value={type.token}
                onChange={this.onGotifyTokenChanged}
              />
            </Box>
          )}

          {type.provider !== 'none' && (
            <NotificationOptions
              notification={options}
              onChange={this.onTriggersChanged}
            />
          )}

          {!saved && !error && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
              }}
            >
              <Button onClick={this.onSaveClicked}>Save</Button>
            </Box>
          )}

          <Snackbar
            open={error !== ''}
            onClose={this.onSnackbarCloseClicked}
            autoHideDuration={3000}
          >
            {error}
          </Snackbar>
        </Box>
      </Box>
    )
  }
}

const mapStateToProps = (state: RootState) => {
  const userNotifications = state.user.profile.notifications

  return {
    initialType: userNotifications.provider,
    initialOptions: userNotifications.triggers,
  }
}

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  updateNotificationSettings: (type: NotificationType, options: NotificationTriggerOptions) =>
    dispatch(updateNotificationSettings({ type, options })),
})

export const NotificationSettings = connect(
  mapStateToProps,
  mapDispatchToProps,
)(NotificationSettingsImpl)
