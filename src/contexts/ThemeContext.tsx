import { ThemeMode } from '@/constants/theme'
import React from 'react'

export type ThemeContextState = {
  themeMode: ThemeMode
  setThemeMode: (themeMode: ThemeMode) => void
}

export const ThemeContext = React.createContext<ThemeContextState>({
  themeMode: 'system',
  setThemeMode: () => {
  },
})
