import { Task } from '@/models/task'
import { TASK_COLOR } from './Colors'
import moment from 'moment'

export type GROUP_BY = 'due_date' | 'labels'

export type TaskGroup = {
  name: string
  content: Task[]
  color: string
}

interface DueDateGroups {
  'overdue': TaskGroup
  'today': TaskGroup
  'tomorrow': TaskGroup
  'this_week': TaskGroup
  'next_week': TaskGroup
  'later': TaskGroup
  'any_time': TaskGroup
}
export type TaskGroups = DueDateGroups

const groupByDueDate = (tasks: Task[]): DueDateGroups => {
  const groups: DueDateGroups = {
    'overdue': {
      name: 'Overdue',
      content: [],
      color: TASK_COLOR.OVERDUE,
    },
    'today': {
      name: 'Today',
      content: [],
      color: TASK_COLOR.TODAY,
    },
    'tomorrow': {
      name: 'Tomorrow',
      content: [],
      color: TASK_COLOR.TOMORROW,
    },
    'this_week': {
      name: 'This week',
      content: [],
      color: TASK_COLOR.THIS_WEEK,
    },
    'next_week': {
      name: 'Next week',
      content: [],
      color: TASK_COLOR.NEXT_WEEK,
    },
    'later': {
      name: 'Later',
      content: [],
      color: TASK_COLOR.LATER,
    },
    'any_time': {
      name: 'Any time',
      content: [],
      color: TASK_COLOR.ANY_TIME,
    }
  }

  const now = new Date().getTime()
  const endOfToday = moment().endOf('day').toDate().getTime()
  const endOfTomorrow = moment().endOf('day').add(1, 'day').toDate().getTime()
  const endOfThisWeek = moment().endOf('isoWeek').toDate().getTime()
  const endOfNextWeek = moment().endOf('isoWeek').add(1, 'week').toDate().getTime()

  tasks.forEach((task) => {
    if (task.next_due_date === null) {
      groups['any_time'].content.push(task)
      return
    }

    const due_date = task.next_due_date.getTime()
    if (now >= due_date) {
      groups['overdue'].content.push(task)
      return
    }

    if (due_date > endOfNextWeek) {
      groups['later'].content.push(task)
      return
    }

    if (due_date > endOfThisWeek) {
      groups['next_week'].content.push(task)
      return
    }

    if (due_date > endOfTomorrow) {
      groups['this_week'].content.push(task)
      return
    }

    if (due_date > endOfToday) {
      groups['tomorrow'].content.push(task)
      return
    }

    groups['today'].content.push(task)
  })

  return groups
}

export const groupTasksBy = (tasks: Task[]/*TODO:, groupBy: GROUP_BY*/): TaskGroups => {
  //if (groupBy === 'due_date') {
    return groupByDueDate(tasks)
  //}
}
