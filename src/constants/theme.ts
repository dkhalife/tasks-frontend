export type ThemeMode = 'light' | 'dark' | 'system'

export const getNextThemeMode = (currentThemeMode: ThemeMode): ThemeMode => {
  switch (currentThemeMode) {
    case 'light':
      return 'dark'
    case 'dark':
      return 'system'
    case 'system':
    default:
      return 'light'
  }
}
