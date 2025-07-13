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
  | 'app_token_created'
  | 'app_token_deleted'
  | 'notification_settings_updated'

export interface WSResponse {
  action: WSEvent
  status: number
  data?: any
}
