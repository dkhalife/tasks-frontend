import { Mode } from '@mui/system/cssVars/useCurrentColorScheme'

export const getCurrentThemeMode = (): Mode => {
  const mode = localStorage.getItem('themeMode')
  if (mode === 'light' || mode === 'dark' || mode === 'system') {
    return mode
  }

  return 'system'
}

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

export const setThemeMode = (mode: Mode): void => {
  console.log('Setting theme mode:', mode)
  localStorage.setItem('themeMode', mode)
}
