export type WSAction =
  | 'get_user_labels'
  | 'create_label'
  | 'update_label'
  | 'delete_label'

export interface WSRequest {
  Action: WSAction
  Data?: unknown
}
