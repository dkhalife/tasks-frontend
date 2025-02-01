import { Request } from "../utils/TokenManager"

export const CreateLabel = label => {
  return Request(`/labels`, 'POST', label)
}

export const GetLabels = async () => {
  const resp = await Request(`/labels`)
  return resp.json()
}

export const UpdateLabel = label => {
  return Request(`/labels`, 'PUT', label)
}

export const DeleteLabel = id => {
  return Request(`/labels/${id}`, 'DELETE')
}