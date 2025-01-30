import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '/tailwind.config'
import { useContext } from 'react'
import { StorageContext, StorageContextState } from '../contexts/StorageContext'

const { theme: THEME } = resolveConfig(tailwindConfig)

export const COLORS = THEME.colors

export type ThemeMode = 'light' | 'dark' | 'system'

export const toggleTheme = () => {
  const storedState = useContext<StorageContextState>(StorageContext)

  let newThemeMode: ThemeMode
  switch (storedState.themeMode) {
    case 'light':
      newThemeMode = 'dark'
      break
    case 'dark':
      newThemeMode = 'system'
      break
    case 'system':
    default:
      newThemeMode = 'light'
      break
  }

  storedState.setThemeMode(newThemeMode)
}
