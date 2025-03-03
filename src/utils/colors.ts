export const LABEL_COLORS = [
  { name: 'Default', value: '#FFFFFF' },
  { name: 'Salmon', value: '#ff7961' },
  { name: 'Teal', value: '#26a69a' },
  { name: 'Sky Blue', value: '#80d8ff' },
  { name: 'Grape', value: '#7e57c2' },
  { name: 'Sunshine', value: '#ffee58' },
  { name: 'Coral', value: '#ff7043' },
  { name: 'Lavender', value: '#ce93d8' },
  { name: 'Rose', value: '#f48fb1' },
  { name: 'Charcoal', value: '#616161' },
  { name: 'Sienna', value: '#8d6e63' },
  { name: 'Mint', value: '#a7ffeb' },
  { name: 'Amber', value: '#ffc107' },
  { name: 'Cobalt', value: '#3f51b5' },
  { name: 'Emerald', value: '#4caf50' },
  { name: 'Peach', value: '#ffab91' },
  { name: 'Ocean', value: '#0288d1' },
  { name: 'Mustard', value: '#ffca28' },
  { name: 'Ruby', value: '#d32f2f' },
  { name: 'Periwinkle', value: '#b39ddb' },
  { name: 'Turquoise', value: '#00bcd4' },
  { name: 'Lime', value: '#cddc39' },
  { name: 'Blush', value: '#f8bbd0' },
  { name: 'Ash', value: '#90a4ae' },
  { name: 'Sand', value: '#d7ccc8' },
]

export const COLORS = {
  white: '#FFFFFF',
  salmon: '#ff7961',
  teal: '#26a69a',
  skyBlue: '#80d8ff',
  grape: '#7e57c2',
  sunshine: '#ffee58',
  coral: '#ff7043',
  lavender: '#ce93d8',
  rose: '#f48fb1',
  charcoal: '#616161',
  sienna: '#8d6e63',
  mint: '#a7ffeb',
  amber: '#ffc107',
  cobalt: '#3f51b5',
  emerald: '#4caf50',
  peach: '#ffab91',
  ocean: '#0288d1',
  mustard: '#ffca28',
  ruby: '#d32f2f',
  periwinkle: '#b39ddb',
  turquoise: '#00bcd4',
  lime: '#cddc39',
  blush: '#f8bbd0',
  ash: '#90a4ae',
  sand: '#d7ccc8',
}

export const TASK_COLOR = {
  COMPLETED: '#4ec1a2',
  LATE: '#f6ad55',
  MISSED: '#F03A47',
  UPCOMING: '#AF5B5B',
  SKIPPED: '#E2C2FF',

  OVERDUE: '#F03A47',
  TODAY: '#ffc107',
  TOMORROW: '#ff9800',
  THIS_WEEK: '#4ec1a2',
  NEXT_WEEK: '#00bcd4',
  LATER: '#d7ccc8',
  ANY_TIME: '#90a4ae',
}

export const getTextColorFromBackgroundColor = (
  bgColor: string | undefined,
) => {
  if (!bgColor) {
    return ''
  }

  const hex = bgColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? '#000000' : '#ffffff'
}
