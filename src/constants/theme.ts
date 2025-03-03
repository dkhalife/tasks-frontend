import { Mode } from '@mui/system/cssVars/useCurrentColorScheme'

export const getNextThemeMode = (currentThemeMode: Mode): Mode => {
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
