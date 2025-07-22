import { HistoryEntry } from "@/models/history"
import { Label } from "@/models/label"
import { Task } from "@/models/task"
import { TaskGroup, TaskGroups } from "./grouping";

export type TaskUI = Omit<Task, 'next_due_date' | 'end_date' | 'labels'> & {
  next_due_date: Date | null
  end_date: Date | null
  labels: Label[]
};

export type HistoryEntryUI = Omit<HistoryEntry, 'due_date' | 'completed_date'> & {
  due_date: Date | null
  completed_date: Date | null
};

export const MakeTaskUI = (task: Task): TaskUI => {
  return {
    ...task,
    next_due_date: MakeDateUI(task.next_due_date),
    end_date: MakeDateUI(task.end_date),
  }
}

export const MakeTaskGroupsUI = (groups: TaskGroups<Task>): TaskGroups<TaskUI> => {
  return Object.fromEntries<TaskGroup<TaskUI>>(
    Object.entries<TaskGroup<Task>>(groups).map(([key, group]) => [
      key,
      {
        ...group,
        content: group.content.map(task => MakeTaskUI(task)),
      },
    ])
  )
}

export function MarshallDate(d: Date): string;
export function MarshallDate(d: null): null;
export function MarshallDate(d: Date | null): string | null;
export function MarshallDate(d: Date | null): string | null {
  return d?.toISOString() ?? null
}

export function MakeDateUI(d: string): Date;
export function MakeDateUI(d: null): null;
export function MakeDateUI(d: string | null): Date | null;
export function MakeDateUI(d: string | null): Date | null {
  return d ? new Date(d) : null
}

export function MakeHistoryUI(entry: HistoryEntry): HistoryEntryUI {
  return {
    ...entry,
    due_date: MakeDateUI(entry.due_date),
    completed_date: MakeDateUI(entry.completed_date),
  }
}

export const MakeTask = (taskUI: Omit<TaskUI, 'id'>): Omit<Task, 'id'> => {
  return {
    ...taskUI,
    next_due_date: MarshallDate(taskUI.next_due_date),
    end_date: MarshallDate(taskUI.end_date),
  }
}
