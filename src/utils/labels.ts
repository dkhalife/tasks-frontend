import { LABEL_COLORS } from './colors'

export type ColorOption = {
  name: string
  value: string
}

export const colorOptionFromColor = (
  color: string,
): ColorOption | undefined => {
  return LABEL_COLORS.find(c => c.value === color) || undefined
}
