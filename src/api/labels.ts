import { Fetch } from "../utils/TokenManager"

export const CreateLabel = label => {
  return Fetch(`/labels`, 'POST', label)
}

export const GetLabels = async () => {
  const resp = await Fetch(`/labels`)
  return resp.json()
}

export const UpdateLabel = label => {
  return Fetch(`/labels`, 'PUT', label)
}

export const DeleteLabel = id => {
  return Fetch(`/labels/${id}`, 'DELETE')
}