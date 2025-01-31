import { Label } from "./label"

export interface FrequencyMetadata {
    unit: string
    time: string
    days?: string[]
    months?: string[]
}

export interface Chore {
    id: string
    title: string
    description: string
    nextDueDate: string
    frequency: string
    labels: Label[]
    isArchived: boolean
    updatedAt: string
}

export type ChoreGroup = {
    name: string
    content: Chore[]
    color?: string
}
  