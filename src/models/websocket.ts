export type WSAction =
  | 'get_user_labels'
  | 'create_label'
  | 'update_label'
  | 'delete_label'

export interface WSRequest {
  action: WSAction
  data?: unknown
}

export interface WSResponse {
  action: WSAction
  status: number
  data?: unknown
}
