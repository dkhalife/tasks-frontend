import { Label } from './label'
import { ColorPaletteProp } from '@mui/joy'
import { dayOfMonthSuffix } from '../utils/date'
import { IntervalUnit } from '@/utils/recurrence'
import { Notification } from '@/models/notifications'
import { differenceInHours, format, formatDistanceToNow, setDay, setMonth } from 'date-fns'

export type RepeatOnce = {
  type: 'once'
}

export type RepeatDaily = {
  type: 'daily'
}

export type RepeatWeekly = {
  type: 'weekly'
}

export type RepeatMonthly = {
  type: 'monthly'
}

export type RepeatYearly = {
  type: 'yearly'
}

export type RepeatInterval = {
  type: 'custom'
  on: 'interval'
  every: number
  unit: IntervalUnit
}

export type DayOfTheWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6
export type UniqueDaysOfWeek = [DayOfTheWeek, ...DayOfTheWeek[]]
export type RepeatDaysOfTheWeek = {
  type: 'custom'
  on: 'days_of_the_week'
  days: UniqueDaysOfWeek
}

export type Month = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11
export type UniqueMonths = [Month, ...Month[]]

export type RepeatDayOfTheMonths = {
  type: 'custom'
  on: 'day_of_the_months'
  months: UniqueMonths
}

export type RepeatCustom =
  | RepeatInterval
  | RepeatDaysOfTheWeek
  | RepeatDayOfTheMonths
export type Frequency =
  | RepeatOnce
  | RepeatDaily
  | RepeatWeekly
  | RepeatMonthly
  | RepeatYearly
  | RepeatCustom

export interface Task {
  id: string
  title: string
  next_due_date: Date | null
  frequency: Frequency
  notification: Notification
  is_rolling: boolean
  labels: Label[]
}

export type TASK_UPDATE_EVENT = 'completed' | 'rescheduled' | 'skipped'

export const getDueDateChipText = (nextDueDate: Date | null): string => {
  if (nextDueDate === null) {
    return 'No Due Date'
  }

  // if due in next 48 hours, we should it in this format : Tomorrow 11:00 AM
  const diff = differenceInHours(nextDueDate, new Date())
  if (diff < 48 && diff > 0) {
    return formatDistanceToNow(nextDueDate, { addSuffix: true })
  }

  return formatDistanceToNow(nextDueDate)
}

export const getDueDateChipColor = (
  nextDueDate: Date | null,
): ColorPaletteProp => {
  if (nextDueDate === null) {
    return 'neutral'
  }

  const due = nextDueDate.getTime()
  const now = new Date().getTime()
  const warnThreshold = new Date().getTime() + 4 * 3600 * 1000

  if (due < now) {
    return 'danger'
  }

  if (due < warnThreshold) {
    return 'warning'
  }

  return 'neutral'
}

export const getRecurrentChipText = (
  nextDueDate: Date | null,
  frequency: Frequency,
) => {
  if (frequency.type === 'once') {
    return 'Once'
  } else if (frequency.type === 'daily') {
    return 'Daily'
  } else if (frequency.type === 'weekly') {
    return 'Weekly'
  } else if (frequency.type === 'monthly') {
    return 'Monthly'
  } else if (frequency.type === 'yearly') {
    return 'Yearly'
  } else if (frequency.type === 'custom') {
    if (frequency.on === 'interval') {
      if (frequency.every == 1) {
        switch (frequency.unit) {
          case 'hours':
            return 'Hourly'
          case 'days':
            return 'Daily'
          case 'weeks':
            return 'Weekly'
          case 'months':
            return 'Monthly'
          case 'years':
            return 'Yearly'
        }
      } else {
        return `Every ${frequency.every} ${frequency.unit}`
      }
    } else if (frequency.on === 'days_of_the_week') {
      return frequency.days
        .map((d: number) => format(setDay(new Date(), d), 'EEE'))
        .join(', ')
    } else if (frequency.on === 'day_of_the_months') {
      const months = frequency.months.map((m: number) =>
        format(setMonth(new Date(), m), 'MMM')
      )
      const day = nextDueDate ? nextDueDate.getDate() : 0
      return `${day}${dayOfMonthSuffix(day)} of ${months.join(', ')}`
    }
  }
}
