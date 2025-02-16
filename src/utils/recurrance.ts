export type IntervalUnit = 'hours' | 'days' | 'weeks' | 'months' | 'years'

export const INTERVAL_UNITS: IntervalUnit[] = [
  'hours',
  'days',
  'weeks',
  'months',
  'years',
]

export type FrequencyType =
  | 'once'
  | 'interval'
  | 'days_of_the_week'
  | 'day_of_the_month'
  | 'custom'

export const FREQUENCY_TYPES: FrequencyType[] = [
  'once',
  'interval',
  'days_of_the_week',
  'day_of_the_month',
]

export type NotificationTrigger = 'dueDate' | 'predue' | 'overdue' | 'nagging'
