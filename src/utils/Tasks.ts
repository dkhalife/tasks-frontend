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
  const endOfThisWeek = moment().endOf('week').toDate().getTime()
  const endOfNextWeek = moment().endOf('week').add(1, 'week').toDate().getTime()

  tasks.forEach((task) => {
    if (task.nextDueDate === null) {
      groups['any_time'].content.push(task)
      return
    }

    const due_date = new Date(task.nextDueDate).getTime()
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

    groups['this_week'].content.push(task)
  })

  return groups
}

export const groupTasksBy = (tasks: Task[], groupBy: GROUP_BY): TaskGroups => {
  //if (groupBy === 'due_date') {
    return groupByDueDate(tasks)
  //}
}
