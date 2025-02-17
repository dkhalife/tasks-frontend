import { Task } from '@/models/task'
import { Request } from '../utils/TokenManager'
import { HistoryEntry } from '@/models/history'

type Marshalled<T> = Omit<T, 'next_due_date'> & {
  next_due_date: number | null
}

type MarshalledTask = Marshalled<Task>

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

function MarshallTask<T extends {
  next_due_date: Date | null
}>(task: T): Marshalled<T> {
  return {
    ...task,
    next_due_date: task.next_due_date?.getTime() ?? null
  }
}

const UnmarshallTask = (task: MarshalledTask): Task => {
  return {
    ...task,
    next_due_date: task.next_due_date ? new Date(task.next_due_date) : null
  }
}

const UnmarshallSingleTaskResponse = (response: SingleMarshalledTaskResponse): SingleTaskResponse => {
  return {
    ...response,
    task: UnmarshallTask(response.task)
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

export const MarkTaskComplete = async (
  id: string,
  completedDate: Date | null,
): Promise<SingleTaskResponse> => {
  const body: {
    completed_date?: number
  } = {}

  if (completedDate) {
    body.completed_date = completedDate.getTime() // TODO: generalize marshalling logic
  }

  return UnmarshallSingleTaskResponse(await Request<SingleMarshalledTaskResponse>(`/tasks/${id}/do`, 'POST', body))
}

export const SkipTask = async (id: string): Promise<SingleTaskResponse> =>
  await UnmarshallSingleTaskResponse(await Request<SingleMarshalledTaskResponse>(`/tasks/${id}/skip`, 'POST'))

export const CreateTask = async (task: Omit<Task, 'id'>) =>
  await Request<void>(`/tasks/`, 'POST', MarshallTask(task),)

export const DeleteTask = async (id: string) =>
  await Request<void>(`/tasks/${id}`, 'DELETE')

export const SaveTask = async (task: Task) =>
  await Request<void>(`/tasks/`, 'PUT', MarshallTask(task))

export const GetTaskHistory = async (taskId: string) =>
  await Request<TaskHistoryResponse>(`/tasks/${taskId}/history`)

export const UpdateDueDate = async (id: string, dueDate: Date | null): Promise<SingleTaskResponse> =>
  await UnmarshallSingleTaskResponse(await Request<SingleMarshalledTaskResponse>(`/tasks/${id}/dueDate`, 'PUT', {
    due_date: dueDate ? dueDate.getTime() : null, // TODO: Generalize marshalling logic
  }))
