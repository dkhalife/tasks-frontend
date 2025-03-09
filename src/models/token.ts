export interface APIToken {
  id: string
  name: string
  token: string
  expiration: Date
}

export type ApiTokenScope =
  | 'task:read'
  | 'task:write'
  | 'label:read'
  | 'label:write'
  | 'user:read'
  | 'user:write'
  | 'token:write'
