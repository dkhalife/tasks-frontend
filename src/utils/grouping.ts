import { Label } from '@/models/label'
import { MakeDateUI, TaskUI } from './marshalling'
import { COLORS, TASK_COLOR } from './colors'
import { addDays, addWeeks, endOfDay, endOfWeek } from 'date-fns'
import { Task } from '@/models/task'

export type GROUP_BY = 'due_date' | 'labels'

export type TaskGroup<T> = {
  name: string
  content: T[]
  color: string
}

export type DueDateGroups<T> = {
  overdue: TaskGroup<T>
  today: TaskGroup<T>
  tomorrow: TaskGroup<T>
  this_week: TaskGroup<T>
  next_week: TaskGroup<T>
  later: TaskGroup<T>
  any_time: TaskGroup<T>
}

export type LabelGroups<T> = Record<string, TaskGroup<T>>
export type TaskGroups<T> = DueDateGroups<T> | LabelGroups<T>

export function getDefaultExpandedState (
  groupBy: GROUP_BY,
  labels: Label[],
): Record<keyof TaskGroups<Task>, boolean> {
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

const getDueDateBoundaries = () => {
  const now = new Date().getTime()
  const endOfToday = endOfDay(new Date()).getTime()
  const endOfTomorrow = endOfDay(addDays(new Date(), 1)).getTime()
  const endOfThisWeek = endOfWeek(new Date(), { weekStartsOn: 1 }).getTime()
  const endOfNextWeek = endOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 }).getTime()

  return { now, endOfToday, endOfTomorrow, endOfThisWeek, endOfNextWeek }
}

const bucketIntoDueDateGroup = (
  task: Task,
  groups: DueDateGroups<Task>,
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

  const due_date = MakeDateUI(task.next_due_date).getTime()
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

const groupByDueDate = (tasks: Task[]): DueDateGroups<Task> => {
  const groups: DueDateGroups<Task> = {
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

  const { now, endOfToday, endOfTomorrow, endOfThisWeek, endOfNextWeek } = getDueDateBoundaries()

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

const bucketTaskIntoDueDateGroup = (task: Task, groups: DueDateGroups<Task>) => {
  const { now, endOfToday, endOfTomorrow, endOfThisWeek, endOfNextWeek } = getDueDateBoundaries()

  bucketIntoDueDateGroup(task, groups, now, endOfToday, endOfTomorrow, endOfThisWeek, endOfNextWeek)
}

const groupByLabels = (tasks: Task[], userLabels: Label[]): LabelGroups<Task> => {
  const groups: LabelGroups<Task> = {}

  userLabels.forEach(label => {
    groups[label.id] = {
      name: label.name,
      content: tasks.filter(
        task => task.labels.some(taskLabel => taskLabel.id === label.id),
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

const bucketTaskIntoLabelGroups = (task: Task, groups: LabelGroups<Task>) => {
  Object.keys(groups).forEach(key => {
    if ((key === 'none' && task.labels.length === 0) || task.labels.some(label => label.id === parseInt(key, 10))) {
      groups[key].content.push(task)
    }
  })
}

export const groupTasksBy = (
  tasks: Task[],
  userLabels: Label[],
  groupBy: GROUP_BY,
): TaskGroups<Task> => {
  if (groupBy === 'due_date') {
    return groupByDueDate(tasks)
  }

  return groupByLabels(tasks, userLabels)
}

export const groupTaskBy = (
  task: Task,
  groups: TaskGroups<Task>,
  groupBy: GROUP_BY,
) => {
  if (groupBy === 'due_date') {
    const dueDateGroups = groups as DueDateGroups<Task>
    bucketTaskIntoDueDateGroup(task, dueDateGroups)
  } else if (groupBy === 'labels') {
    const labelGroups = groups as LabelGroups<Task>
    bucketTaskIntoLabelGroups(task, labelGroups)
  }
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
