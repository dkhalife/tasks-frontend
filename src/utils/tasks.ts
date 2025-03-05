import { Task } from '@/models/task'
import { COLORS, TASK_COLOR } from './colors'
import moment from 'moment'
import { Label } from '@/models/label'
import { DueDateGroups, GROUP_BY, LabelGroups } from '@/utils/grouping'

export type TaskGroup = {
  name: string
  content: Task[]
  color: string
}

export type TaskGroups = DueDateGroups | LabelGroups

export const bucketIntoDueDateGroup = (
  task: Task,
  groups: DueDateGroups,
  now: number,
  endOfToday: number,
  endOfTomorrow: number,
  endOfThisWeek: number,
  endOfNextWeek: number,
) => {
  if (task.next_due_date === null) {
    groups['any_time'].content.push(task)
    return
  }

  const due_date = task.next_due_date.getTime()
  if (now >= due_date) {
    groups['overdue'].content.push(task)
    return
  }

  if (endOfToday > due_date) {
    groups['today'].content.push(task)
    return
  }

  if (endOfTomorrow > due_date) {
    groups['tomorrow'].content.push(task)
    return
  }

  if (endOfThisWeek > due_date) {
    groups['this_week'].content.push(task)
    return
  }

  if (endOfNextWeek > due_date) {
    groups['next_week'].content.push(task)
    return
  }

  groups['later'].content.push(task)
}

export const bucketIntoLabelGroups = (task: Task, groups: LabelGroups) => {
  task.labels.forEach(label => {
    groups[label.id].content.push(task)
  })
}

const groupByDueDate = (tasks: Task[]): DueDateGroups => {
  const groups: DueDateGroups = {
    overdue: {
      name: 'Overdue',
      content: [],
      color: TASK_COLOR.OVERDUE,
    },
    today: {
      name: 'Today',
      content: [],
      color: TASK_COLOR.TODAY,
    },
    tomorrow: {
      name: 'Tomorrow',
      content: [],
      color: TASK_COLOR.TOMORROW,
    },
    this_week: {
      name: 'This week',
      content: [],
      color: TASK_COLOR.THIS_WEEK,
    },
    next_week: {
      name: 'Next week',
      content: [],
      color: TASK_COLOR.NEXT_WEEK,
    },
    later: {
      name: 'Later',
      content: [],
      color: TASK_COLOR.LATER,
    },
    any_time: {
      name: 'Any time',
      content: [],
      color: TASK_COLOR.ANY_TIME,
    },
  }

  const now = new Date().getTime()
  const endOfToday = moment().endOf('day').toDate().getTime()
  const endOfTomorrow = moment().endOf('day').add(1, 'day').toDate().getTime()
  const endOfThisWeek = moment().endOf('isoWeek').toDate().getTime()
  const endOfNextWeek = moment()
    .endOf('isoWeek')
    .add(1, 'week')
    .toDate()
    .getTime()

  tasks.forEach(task => {
    bucketIntoDueDateGroup(
      task,
      groups,
      now,
      endOfToday,
      endOfTomorrow,
      endOfThisWeek,
      endOfNextWeek,
    )
  })

  return groups
}

const groupByLabels = (tasks: Task[], userLabels: Label[]): LabelGroups => {
  const groups: LabelGroups = {}

  userLabels.forEach(label => {
    groups[label.id] = {
      name: label.name,
      content: tasks.filter(
        task => task.labels.findIndex(l => l.id === label.id) !== -1,
      ),
      color: label.color,
    }
  })

  groups['none'] = {
    name: 'None',
    content: tasks.filter(task => task.labels.length === 0),
    color: COLORS.white,
  }

  return groups
}

export const groupTasksBy = (
  tasks: Task[],
  userLabels: Label[],
  groupBy: GROUP_BY,
): TaskGroups => {
  if (groupBy === 'due_date') {
    return groupByDueDate(tasks)
  }

  return groupByLabels(tasks, userLabels)
}

export const sortTasksByDueDate = (tasks: Task[]): Task[] => {
  return tasks.sort((a, b) => {
    if (a.next_due_date === null) {
      return 1
    }

    if (b.next_due_date === null) {
      return -1
    }

    return a.next_due_date.getTime() - b.next_due_date.getTime()
  })
}
