export type NotificationDisabled = {
  enabled: false
}
export type NotificationMqtt = object
export type NotificationTrigger = 'due_date' | 'pre_due' | 'overdue' | 'nag'
export type NotificationTriggerOptions = Record<NotificationTrigger, boolean>
export type NotificationEnabled = {
  enabled: true
} & NotificationTriggerOptions & (NotificationMqtt)
export type Notification = NotificationDisabled | NotificationEnabled
export type NotificationProvider = 'none' | 'webhook'
export type NotificationTypeNone = {
  provider: 'none'
}

export type NotificationTypeWebhook = {
  provider: 'webhook'
  url: string
  method: 'GET' | 'POST'
}

export type NotificationType = NotificationTypeNone | NotificationTypeWebhook

export const getDefaultTypeForProvider = (provider: NotificationProvider): NotificationType => {
  switch (provider) {
    default:
    case 'none':
      return {
        provider: 'none',
      }

    case 'webhook':
      return {
        provider: 'webhook',
        url: '',
        method: 'GET',
      }
  }
}

export type NotificationTriggerOption = {
  type: NotificationTrigger
  title: string
  description: string
}

export const NotificationTriggerOptions: NotificationTriggerOption[] = [
  {
    title: 'Due Date/Time',
    description: 'After the due date and time has passed',
    type: 'due_date',
  },
  {
    title: 'Predued',
    description: 'A few hours before the due date',
    type: 'pre_due',
  },
  {
    title: 'Overdue',
    description: 'When left uncompleted at least one day past its due date',
    type: 'overdue',
  },
  {
    title: 'Nagging',
    description: 'Daily until completed',
    type: 'nag',
  },
]
