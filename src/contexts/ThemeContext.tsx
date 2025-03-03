import { ThemeMode } from '@/constants/theme'
import { retrieveValue, storeValue } from '@/utils/Storage'
import { CssBaseline, CssVarsProvider, extendTheme } from '@mui/joy'
import React from 'react'

interface ThemeContextProps {
  children: React.ReactNode
}

export type ThemeContextState = {
  themeMode: ThemeMode
  setThemeMode: (themeMode: ThemeMode) => void
}

const initialThemeMode = retrieveValue<ThemeMode>('themeMode', 'system')

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        // TODO: theming
        // primary: primaryPalette,
        success: {
          50: '#f3faf7',
          100: '#def5eb',
          200: '#b7e7d5',
          300: '#8ed9be',
          400: '#6ecdb0',
          500: '#4ec1a2',
          600: '#46b89a',
          700: '#3cae91',
          800: '#32a487',
          900: '#229d76',
        },
        danger: {
          50: '#fef2f2',
          100: '#fde8e8',
          200: '#fbd5d5',
          300: '#f9c1c1',
          400: '#f6a8a8',
          500: '',
          600: '#f47272',
          700: '#e33434',
          800: '#cc1f1a',
          900: '#b91c1c',
        },
        warning: {
          50: '#fffdf7',
          100: '#fef8e1',
          200: '#fdecb2',
          300: '#fcd982',
          400: '#fbcf52',
          500: '#f9c222',
          600: '#f6b81e',
          700: '#f3ae1a',
          800: '#f0a416',
          900: '#e99b0e',
        },
      },
    },
    // TODO: Theming
    // dark: {
    //   palette: {
    //     primary: primaryPalette,
    //   },
    // },
  },
})

export const ThemeContext = React.createContext<ThemeContextState>({
  themeMode: initialThemeMode,
  setThemeMode: (themeMode: ThemeMode) => {
    storeValue('themeMode', themeMode)
  },
})

export class ThemeContextProvider extends React.Component<
  ThemeContextProps,
  ThemeContextState
> {
  constructor(props: ThemeContextProps) {
    super(props)
    this.state = {
      themeMode: initialThemeMode,
      setThemeMode: this.setThemeMode,
    }
  }

  private setThemeMode = (themeMode: ThemeMode) => {
    storeValue('themeMode', themeMode)
    this.setState({ themeMode })
  }

  render() {
    return (
      <ThemeContext.Provider value={this.state}>
        <CssBaseline />
        <CssVarsProvider theme={theme}>
          {this.props.children}
        </CssVarsProvider>
      </ThemeContext.Provider>
    )
  }
}
