import { Task } from '@/models/task'
import { Request } from '../utils/TokenManager'
import { HistoryEntry } from '@/models/history'
import { Label } from '@/models/label'

type MarshalledTask = Omit<Omit<Task, 'next_due_date'>, 'labels'> & {
  next_due_date: string | null,
  labels: string[]
}
type MarshalledHistoryEntry = Omit<Omit<HistoryEntry, 'due_date'>, 'completed_date'> & {
  due_date: string | null,
  completed_date: string | null,
}

type SingleTaskResponse = {
  task: Task
}

type SingleMarshalledTaskResponse = {
  task: MarshalledTask
}

type TasksResponse = {
  tasks: Task[]
}

type MarshalledTasksResponse = {
  tasks: MarshalledTask[]
}

type TaskHistoryResponse = {
  history: HistoryEntry[]
}

type MarshalledTaskHistoryResponse = {
  history: MarshalledHistoryEntry[]
}

function MarshallDate(d: Date | null): string | null {
  return d?.toISOString() ?? null
}

function UnmarshallDate(d: string | null): Date | null {
  // Date should be handled in UTC format
  return d && d.length > 0 ? new Date(d) : null
}

function MarshallTask(task: Task): MarshalledTask {
  return {
    ...task,
    next_due_date: MarshallDate(task.next_due_date),
    labels: task.labels.map(l => l.id),
  }
}

const UnmarshallTask = (task: MarshalledTask): Task => {
  return {
    ...task,
    next_due_date: UnmarshallDate(task.next_due_date),
    labels: task.labels as unknown as Label[], // TODO: Server should marshall into ids
  }
}

const UnmarshallHistoryEntry = (entry: MarshalledHistoryEntry): HistoryEntry => {
  return {
    ...entry,
    completed_date: UnmarshallDate(entry.completed_date),
    due_date: UnmarshallDate(entry.due_date),
  }
}

const UnmarshallSingleTaskResponse = (response: SingleMarshalledTaskResponse): SingleTaskResponse => {
  return {
    ...response,
    task: UnmarshallTask(response.task)
  }
}

const UnmarshallTaskHistoryResponse = (response: MarshalledTaskHistoryResponse): TaskHistoryResponse => {
  return {
    ...response,
    history: response.history.map(UnmarshallHistoryEntry)
  }
}

const UnmarshallTasksResponse = (response: MarshalledTasksResponse): TasksResponse => {
  return {
    ...response,
    tasks: [
      ...response.tasks.map(UnmarshallTask)
    ]
  }
}

export const GetTasks = async (): Promise<TasksResponse> => UnmarshallTasksResponse(await Request<MarshalledTasksResponse>(`/tasks/`))

export const GetTaskByID = async (id: string): Promise<SingleTaskResponse> => UnmarshallSingleTaskResponse(await Request<SingleMarshalledTaskResponse>(`/tasks/${id}`))

export const MarkTaskComplete = async (id: string): Promise<SingleTaskResponse> => {
  return UnmarshallSingleTaskResponse(await Request<SingleMarshalledTaskResponse>(`/tasks/${id}/do`, 'POST'))
}

export const SkipTask = async (id: string): Promise<SingleTaskResponse> =>
  await UnmarshallSingleTaskResponse(await Request<SingleMarshalledTaskResponse>(`/tasks/${id}/skip`, 'POST'))

export const CreateTask = async (task: Omit<Task, 'id'>) =>
  await Request<void>(`/tasks/`, 'POST', MarshallTask(task as Task))

export const DeleteTask = async (id: string) =>
  await Request<void>(`/tasks/${id}`, 'DELETE')

export const SaveTask = async (task: Task) =>
  await Request<void>(`/tasks/`, 'PUT', MarshallTask(task))

export const GetTaskHistory = async (taskId: string) => await UnmarshallTaskHistoryResponse(
  await Request<MarshalledTaskHistoryResponse>(`/tasks/${taskId}/history`))

export const UpdateDueDate = async (id: string, dueDate: Date | null): Promise<SingleTaskResponse> =>
  await UnmarshallSingleTaskResponse(await Request<SingleMarshalledTaskResponse>(`/tasks/${id}/dueDate`, 'PUT', {
    due_date: MarshallDate(dueDate),
  }))
