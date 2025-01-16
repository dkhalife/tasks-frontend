import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '/tailwind.config'

const { theme: THEME } = resolveConfig(tailwindConfig)

export const COLORS = THEME.colors

export type ThemeMode = 'light' | 'dark' | 'system'
