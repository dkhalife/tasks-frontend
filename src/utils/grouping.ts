import { Label } from "@/models/label"
import { TaskGroup, TaskGroups } from "@/utils/tasks"

export type GROUP_BY = 'due_date' | 'labels'

export interface DueDateGroups {
  'overdue': TaskGroup
  'today': TaskGroup
  'tomorrow': TaskGroup
  'this_week': TaskGroup
  'next_week': TaskGroup
  'later': TaskGroup
  'any_time': TaskGroup
}

export type LabelGroups = Record<string, TaskGroup>

export const getDefaultExpandedState = (groupBy: GROUP_BY, labels: Label[]): Record<keyof TaskGroups, boolean> => {
  if (groupBy === 'due_date') {
    return {
      'overdue': false,
      'today': false,
      'tomorrow': false,
      'this_week': false,
      'next_week': false,
      'later': false,
      'any_time': false,
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