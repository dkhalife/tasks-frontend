export interface NotificationType {
  type: number
}

export interface User {
  display_name: string
  notification_type: NotificationType
}

export const validateEmail = (email: string) => {
  return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)
}

export const validatePassword = (password: string) => {
  return password.length >= 8
}
