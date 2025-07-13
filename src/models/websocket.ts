import { generateGUID } from '@/utils/guid'

export type WSAction =
  | 'get_user_labels'
  | 'create_label'
  | 'update_label'
  | 'delete_label'

export interface WSRequest {
  requestId?: string
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
  requestId?: string
  data?: any
}

export const newWSRequest = (
  action: WSAction,
  data?: unknown,
): WSRequest => ({
  action,
  data,
  requestId: generateGUID(),
})
