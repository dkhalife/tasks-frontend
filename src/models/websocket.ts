export type WSAction =
  | 'get_user_labels'
  | 'create_label'
  | 'update_label'
  | 'delete_label'

export interface WSRequest {
  action: WSAction
  data?: unknown
}

export type WSEvent =
  | 'label_created'
  | 'label_updated'
  | 'label_deleted'

export interface WSResponse {
  action: WSEvent
  status: number
  data?: any
}
