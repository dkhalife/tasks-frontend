import { Label } from '@/models/label'
import { TaskUI } from './marshalling'
import { COLORS, TASK_COLOR } from './colors'
import { addDays, addWeeks, endOfDay, endOfWeek } from 'date-fns'

export type GROUP_BY = 'due_date' | 'labels'

export type TaskGroup = {
  name: string
  content: TaskUI[]
  color: string
}

export interface DueDateGroups {
  overdue: TaskGroup
  today: TaskGroup
  tomorrow: TaskGroup
  this_week: TaskGroup
  next_week: TaskGroup
  later: TaskGroup
  any_time: TaskGroup
}

export type LabelGroups = Record<string, TaskGroup>
export type TaskGroups = DueDateGroups | LabelGroups

export const getDefaultExpandedState = (
  groupBy: GROUP_BY,
  labels: Label[],
): Record<keyof TaskGroups, boolean> => {
  if (groupBy === 'due_date') {
    return {
      overdue: false,
      today: false,
      tomorrow: false,
      this_week: false,
      next_week: false,
      later: false,
      any_time: false,
    }
  }

  const expanded: Record<string, boolean> = {}

  if (groupBy === 'labels') {
    labels.forEach(label => {
      expanded[label.id] = false
    })
  }

  return expanded
}

export const bucketIntoDueDateGroup = (
  task: TaskUI,
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

export const bucketIntoLabelGroups = (task: TaskUI, groups: LabelGroups) => {
  task.labels.forEach(label => {
    groups[label.id].content.push(task)
  })
}

const groupByDueDate = (tasks: TaskUI[]): DueDateGroups => {
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
  const endOfToday = endOfDay(new Date()).getTime()
  const endOfTomorrow = endOfDay(addDays(new Date(), 1)).getTime()
  const endOfThisWeek = endOfWeek(new Date(), { weekStartsOn: 1 }).getTime()
  const endOfNextWeek = endOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 }).getTime()

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

const groupByLabels = (tasks: TaskUI[], userLabels: Label[]): LabelGroups => {
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
  tasks: TaskUI[],
  userLabels: Label[],
  groupBy: GROUP_BY,
): TaskGroups => {
  if (groupBy === 'due_date') {
    return groupByDueDate(tasks)
  }

  return groupByLabels(tasks, userLabels)
}

export const sortTasksByDueDate = (tasks: TaskUI[]): TaskUI[] => {
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
