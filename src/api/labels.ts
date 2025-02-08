import { Label } from "@/models/label"
import { Request } from "../utils/TokenManager"

type LabelsResponse = {
  "labels": Label[]
}

export const CreateLabel = async (label: Omit<Label, 'id'>) => await Request<void>(`/labels`, 'POST', label)
export const GetLabels = async () => await Request<LabelsResponse>(`/labels`)
export const UpdateLabel = async (label: Label) => await Request<void>(`/labels`, 'PUT', label)
export const DeleteLabel = async (id: string) => await Request<void>(`/labels/${id}`, 'DELETE')