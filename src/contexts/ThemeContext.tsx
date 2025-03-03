import { ThemeMode } from '@/constants/theme'
import { retrieveValue, storeValue } from '@/utils/Storage'
import React from 'react'

export type ThemeContextState = {
  themeMode: ThemeMode
  setThemeMode: (themeMode: ThemeMode) => void
}

const initialThemeMode = retrieveValue<ThemeMode>('themeMode', 'system')

export const ThemeContext = React.createContext<ThemeContextState>({
  themeMode: initialThemeMode,
  setThemeMode: (themeMode: ThemeMode) => {
    storeValue('themeMode', themeMode)
  },
})
