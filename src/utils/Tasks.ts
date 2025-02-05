import { Label } from '@/models/label'
import { Task, TaskGroup } from '@/models/task'
import { TASK_COLOR } from './Colors'

export const TasksGrouper = (groupBy: string, tasks: Task[]) => {
  tasks.sort((a, b) => {
    if (a.nextDueDate === null) {
      return 1
    }
    if (b.nextDueDate === null) {
      return -1
    }
    return new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime()
  })

  const labels: { [key: string]: Label } = {}
  let groups: TaskGroup[] = []
  let groupRaw: { [key: string]: Task[] } = {
    Today: [],
    'In a week': [],
    'This month': [],
    Later: [],
    Overdue: [],
    Anytime: [],
  }
  switch (groupBy) {
    case 'due_date':
      tasks.forEach(task => {
        if (task.nextDueDate === null) {
          groupRaw.Anytime.push(task)
        } else if (new Date(task.nextDueDate) < new Date()) {
          groupRaw['Overdue'].push(task)
        } else if (
          new Date(task.nextDueDate).toDateString() ===
          new Date().toDateString()
        ) {
          groupRaw['Today'].push(task)
        } else if (
          new Date(task.nextDueDate) <
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
          new Date(task.nextDueDate) > new Date()
        ) {
          groupRaw['In a week'].push(task)
        } else if (
          new Date(task.nextDueDate).getMonth() === new Date().getMonth()
        ) {
          groupRaw['This month'].push(task)
        } else {
          groupRaw['Later'].push(task)
        }
      })
      groups = [
        {
          name: 'Overdue',
          content: groupRaw['Overdue'],
          color: TASK_COLOR.OVERDUE,
        },
        { name: 'Today', content: groupRaw['Today'], color: TASK_COLOR.TODAY },
        {
          name: 'In a week',
          content: groupRaw['In a week'],
          color: TASK_COLOR.IN_A_WEEK,
        },
        {
          name: 'This month',
          content: groupRaw['This month'],
          color: TASK_COLOR.THIS_MONTH,
        },
        {
          name: 'Later',
          content: groupRaw['Later'],
          color: TASK_COLOR.LATER,
        },
        {
          name: 'Anytime',
          content: groupRaw['Anytime'],
          color: TASK_COLOR.ANYTIME,
        },
      ]
      break
    case 'labels':
      groupRaw = {}
      tasks.forEach(task => {
        task.labels.forEach(label => {
          labels[label.id] = label
          if (groupRaw[label.id] === undefined) {
            groupRaw[label.id] = []
          }
          groupRaw[label.id].push(task)
        })
      })
      groups = Object.keys(groupRaw).map(key => {
        return {
          name: labels[key].name,
          content: groupRaw[key],
        }
      })
      groups.sort((a, b) => {
        return a.name < b.name ? 1 : -1
      })
  }
  return groups
}
