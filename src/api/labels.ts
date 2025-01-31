import { Fetch, HEADERS } from "../utils/TokenManager"

export const CreateLabel = label => {
  return Fetch(`/labels`, {
    method: 'POST',
    headers: HEADERS(),
    body: JSON.stringify(label),
  })
}

export const GetLabels = async () => {
  const resp = await Fetch(`/labels`, {
    method: 'GET',
    headers: HEADERS(),
  })
  return resp.json()
}

export const UpdateLabel = label => {
  return Fetch(`/labels`, {
    method: 'PUT',
    headers: HEADERS(),
    body: JSON.stringify(label),
  })
}

export const DeleteLabel = id => {
  return Fetch(`/labels/${id}`, {
    method: 'DELETE',
    headers: HEADERS(),
  })
}