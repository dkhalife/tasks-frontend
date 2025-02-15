import moment from 'moment'
import { Label } from './label'
import { ColorPaletteProp } from '@mui/joy'
import { dayOfMonthSuffix } from '../utils/date'

export interface FrequencyMetadata {
  unit: string
  time: string
  days?: string[]
  months?: string[]
}

export interface Task {
  id: string
  title: string
  description: string
  next_due_date: Date | null
  frequency: number
  frequency_type: string
  frequency_metadata: string
  labels: Label[]
}

export const getDueDateChipText = (nextDueDate: Date | null): string => {
  if (nextDueDate === null) {
    return 'No Due Date'
  }

  // if due in next 48 hours, we should it in this format : Tomorrow 11:00 AM
  const diff = moment(nextDueDate).diff(moment(), 'hours')
  if (diff < 48 && diff > 0) {
    return moment(nextDueDate).calendar().replace(' at', '')
  }

  return moment(nextDueDate).fromNow()
}

export const getDueDateChipColor = (nextDueDate: Date | null): ColorPaletteProp => {
  if (nextDueDate === null) {
    return 'neutral'
  }

  const due = nextDueDate.getTime()
  const now = new Date().getTime()
  const warnThreshold = moment().add(4, 'hours').toDate().getTime()

  if (due < now) {
    return 'danger'
  }

  if (due < warnThreshold) {
    return 'warning'
  }

  return 'neutral'
}

export const getRecurrentChipText = (task: Task) => {
  if (task.frequency_type === 'once') {
    return 'Once'
  } else if (task.frequency_type === 'trigger') {
    return 'Trigger'
  } else if (task.frequency_type === 'daily') {
    return 'Daily'
  } else if (task.frequency_type === 'adaptive') {
    return 'Adaptive'
  } else if (task.frequency_type === 'weekly') {
    return 'Weekly'
  } else if (task.frequency_type === 'monthly') {
    return 'Monthly'
  } else if (task.frequency_type === 'yearly') {
    return 'Yearly'
  } else if (task.frequency_type === 'days_of_the_week') {
    let days = JSON.parse(task.frequency_metadata).days
    if (days.length > 4) {
      const allDays = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ]
      const selectedDays = days.map((d: string) =>
        moment().day(d).format('dddd'),
      )
      const notSelectedDay = allDays.filter(day => !selectedDays.includes(day))
      const notSelectedShortdays = notSelectedDay.map(d =>
        moment().day(d).format('ddd'),
      )
      return `Daily except ${notSelectedShortdays.join(', ')}`
    } else {
      days = days.map((d: string) => moment().day(d).format('ddd'))
      return days.join(', ')
    }
  } else if (task.frequency_type === 'day_of_the_month') {
    const months = JSON.parse(task.frequency_metadata).months
    if (months.length > 6) {
      const allMonths = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ]
      const selectedMonths = months.map((m: string) =>
        moment().month(m).format('MMMM'),
      )
      const notSelectedMonth = allMonths.filter(
        month => !selectedMonths.includes(month),
      )
      const notSelectedShortMonths = notSelectedMonth.map(m =>
        moment().month(m).format('MMM'),
      )
      return `${task.frequency}${dayOfMonthSuffix(
        task.frequency,
      )} except ${notSelectedShortMonths.join(', ')}`
    } else {
      const freqData = JSON.parse(task.frequency_metadata)
      const months = freqData.months.map((m: string) =>
        moment().month(m).format('MMM'),
      )
      return `${task.frequency}${dayOfMonthSuffix(
        task.frequency,
      )} of ${months.join(', ')}`
    }
  } else if (task.frequency_type === 'interval') {
    return `Every ${task.frequency} ${JSON.parse(task.frequency_metadata).unit}`
  } else {
    return task.frequency_type
  }
}
