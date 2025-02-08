import { COLORS } from '@/utils/Colors'
import { CssBaseline } from '@mui/joy'
import { CssVarsProvider, extendTheme } from '@mui/joy/styles'
import React from 'react'

const primaryColor = 'cyan'

const shades = [
  '50',
  ...Array.from({ length: 9 }, (_, i) => String((i + 1) * 100)),
]

const getPallete = (key = primaryColor) => {
  return shades.reduce((acc: any, shade) => {
    acc[shade] = COLORS[key][shade]
    return acc
  }, {})
}

const primaryPalette = getPallete(primaryColor)

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: primaryPalette,
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
  dark: {
    palette: {
      primary: primaryPalette,
    },
  },
})

interface ThemeContextProps {
  children: React.ReactNode
}

export class ThemeContext extends React.Component<ThemeContextProps> {
  render() {
    return (
      <CssVarsProvider theme={theme}>
        <CssBaseline />
        {this.props.children}
      </CssVarsProvider>
    )
  }
}
