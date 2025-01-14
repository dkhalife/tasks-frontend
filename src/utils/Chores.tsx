import { TASK_COLOR } from './Colors'

export const ChoresGrouper = (groupBy, chores: any[]) => {
  chores.sort((a, b) => {
    if (a.nextDueDate === null) {
      return 1
    }
    if (b.nextDueDate === null) {
      return -1
    }
    return new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime()
  })

  const labels: any = {}
  let groups: any[] = []
  let groupRaw: any = {
    Today: [],
    'In a week': [],
    'This month': [],
    Later: [],
    Overdue: [],
    Anytime: [],
  }
  switch (groupBy) {
    case 'due_date':
      chores.forEach(chore => {
        if (chore.nextDueDate === null) {
          groupRaw.Anytime.push(chore)
        } else if (new Date(chore.nextDueDate) < new Date()) {
          groupRaw['Overdue'].push(chore)
        } else if (
          new Date(chore.nextDueDate).toDateString() ===
          new Date().toDateString()
        ) {
          groupRaw['Today'].push(chore)
        } else if (
          new Date(chore.nextDueDate) <
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
          new Date(chore.nextDueDate) > new Date()
        ) {
          groupRaw['In a week'].push(chore)
        } else if (
          new Date(chore.nextDueDate).getMonth() === new Date().getMonth()
        ) {
          groupRaw['This month'].push(chore)
        } else {
          groupRaw['Later'].push(chore)
        }
      })
      groups = [
        {
          name: 'Overdue',
          content: groupRaw['Overdue'],
          color: TASK_COLOR.OVERDUE,
        },
        { name: 'Today',
          content: groupRaw['Today'],
          color: TASK_COLOR.TODAY },
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
        { name: 'Later',
          content: groupRaw['Later'],
          color: TASK_COLOR.LATER },
        {
          name: 'Anytime',
          content: groupRaw['Anytime'],
          color: TASK_COLOR.ANYTIME,
        },
      ]
      break
    case 'labels':
      groupRaw = {}
      chores.forEach(chore => {
        chore.labels.forEach(label => {
          labels[label.id] = label
          if (groupRaw[label.id] === undefined) {
            groupRaw[label.id] = []
          }
          groupRaw[label.id].push(chore)
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
