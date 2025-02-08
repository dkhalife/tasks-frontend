export const getPathName = () => document.location.pathname

export const getQuery = (key: string): string => {
  return new URLSearchParams(document.location.search).get(key) ?? ''
}

export const goTo = (url: string) => {
  document.location.href = url
}

export const goToLogin = () => {
  goTo('/login')
}

export const goToResetPassword = () => {
  goTo('/forgot-password')
}

export const goToMyTasks = () => {
  goTo('/my/tasks')
}

export const goToRegister = () => {
  goTo('/signup')
}

export const goToTaskCreate = () => {
  goTo(`/tasks/create`)
}

export const goToTask = (taskId: string) => {
  goTo(`/tasks/${taskId}`)
}
export const goToTaskEdit = (taskId: string) => {
  goTo(`/tasks/${taskId}/edit`)
}

export const goToTaskHistory = (taskId: string) => {
  goTo(`/tasks/${taskId}/history`)
}
