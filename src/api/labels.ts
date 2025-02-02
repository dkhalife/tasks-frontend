import { Label } from "@/models/label"
import { Request } from "../utils/TokenManager"

export const CreateLabel = (label: Omit<Label, 'id'>) => {
  return Request(`/labels`, 'POST', label)
}

export const GetLabels = async () => {
  const response = await Request(`/labels`)
  return response.json()
}

export const UpdateLabel = (label: Label) => {
  return Request(`/labels`, 'PUT', label)
}

export const DeleteLabel = (id: string) => {
  return Request(`/labels/${id}`, 'DELETE')
}