import { Fetch } from "../utils/TokenManager"

export const CreateLabel = label => {
  return Fetch(`/labels`, {
    method: 'POST',
    body: JSON.stringify(label),
  })
}

export const GetLabels = async () => {
  const resp = await Fetch(`/labels`, {
    method: 'GET',
  })
  return resp.json()
}

export const UpdateLabel = label => {
  return Fetch(`/labels`, {
    method: 'PUT',
    body: JSON.stringify(label),
  })
}

export const DeleteLabel = id => {
  return Fetch(`/labels/${id}`, {
    method: 'DELETE',
  })
}