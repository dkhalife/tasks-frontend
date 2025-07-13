import React from 'react'
import {
  Box,
  Card,
  Checkbox,
  FormControl,
  FormHelperText,
  Typography,
} from '@mui/joy'
import {
  NotificationTriggerOption,
  NotificationTriggerOptions,
} from '@/models/notifications'
import WebSocketManager from '@/utils/websocket'

type NotificationOptionsProps = {
  notification: NotificationTriggerOptions
  onChange: (notification: NotificationTriggerOptions) => void
}

type NotificationOptionsState = {
  notification: NotificationTriggerOptions
}

export class NotificationOptions extends React.Component<
  NotificationOptionsProps,
  NotificationOptionsState
> {
  private ws: WebSocketManager

  constructor(props: NotificationOptionsProps) {
    super(props)

    this.ws = WebSocketManager.getInstance()

    this.state = {
      notification: props.notification,
    }
  }

  componentDidMount(): void {
    this.registerWebSocketListeners()
  }

  componentWillUnmount(): void {
    this.unregisterWebSocketListeners()
  }

  private registerWebSocketListeners = () => {
    this.ws.on('notification_settings_updated', this.onNotificationSettingsUpdatedWS);
  }

  private unregisterWebSocketListeners = () => {
    this.ws.off('notification_settings_updated', this.onNotificationSettingsUpdatedWS);
  }

  private onNotificationSettingsUpdatedWS = (data: any) => {
    this.setState({
      notification: data.triggers,
    })
  }

  private onNotificationOptionChange = (item: NotificationTriggerOption) => {
    const { notification } = this.state

    const newNotification = {
      ...notification,
      [item.type]: !notification[item.type],
    }

    this.setState({
      notification: newNotification,
    })

    this.props.onChange(newNotification)
  }

  render() {
    const { notification } = this.state

    return (
      <Box
        mt={1}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,

          '& > div': { p: 2, borderRadius: 'md', display: 'flex' },
        }}
      >
        <Card variant='outlined'>
          <Typography>When should notifications trigger?</Typography>
          {NotificationTriggerOptions.map(item => (
            <FormControl
              sx={{ mb: 1 }}
              key={item.type}
            >
              <Checkbox
                overlay
                onClick={() => this.onNotificationOptionChange(item)}
                checked={notification[item.type]}
                label={item.title}
                key={item.title}
              />
              <FormHelperText>{item.description}</FormHelperText>
            </FormControl>
          ))}
        </Card>
      </Box>
    )
  }
}
