export type NotificationDisabled = {
  enabled: false
}
export type NotificationMqtt = object
export type NotificationTrigger = 'due_date' | 'pre_due' | 'overdue' | 'nag'
export type NotificationEnabled = {
  enabled: true
} & Record<NotificationTrigger, boolean> & (NotificationMqtt)
export type Notification = NotificationDisabled | NotificationEnabled

export type NotificationNone = {
  type: 'none'
}

export type NotificationWebhook = {
  type: 'webhook'
  url: string
  method: 'GET' | 'POST'
}

export type NotificationType = NotificationNone | NotificationWebhook

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
