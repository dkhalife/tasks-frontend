export const getPathName = () => document.location.pathname

export const getQuery = (key: string): string => {
  return new URLSearchParams(document.location.search).get(key) ?? ''
}

export const NavigationPaths = {
  Login: '/login',
  Register: '/signup',
  ResetPassword: '/forgot-password',
  MyTasks: '/my/tasks',
  Labels: '/labels',
  TaskCreate: '/tasks/create',
  TaskEdit: (taskId: string) => `/tasks/${taskId}/edit`,
  TaskView: (taskId: string) => `/tasks/${taskId}`,
  TaskHistory: (taskId: string) => `/tasks/${taskId}/history`,
}

export interface WithNavigate {
  navigate: (path: string) => void
}