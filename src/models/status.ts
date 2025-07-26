export type StatusSeverity = 'error' | 'success' | 'info' | 'warning'

export interface Status {
  id: string
  message: string
  severity: StatusSeverity
  timeout?: number
  createdAt: number
}
