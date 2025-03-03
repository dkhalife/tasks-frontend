import { Mode } from '@mui/system/cssVars/useCurrentColorScheme'
import {
  DarkModeOutlined,
  BrightnessAuto,
  LightModeOutlined,
} from '@mui/icons-material'
import { FormControl, IconButton } from '@mui/joy'
import { SxProps } from '@mui/material'
import React from 'react'

interface ThemeToggleButtonProps {
  sx: SxProps
  themeMode: Mode
  onThemeModeToggle: () => void
}

export class ThemeToggleButton extends React.Component<ThemeToggleButtonProps> {
  private onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    e.stopPropagation()

    this.props.onThemeModeToggle()
  }

  render(): React.ReactNode {
    const { themeMode } = this.props

    return (
      <FormControl sx={this.props.sx}>
        <IconButton onClick={this.onClick}>
          {themeMode === 'light' ? (
            <DarkModeOutlined />
          ) : themeMode === 'dark' ? (
            <BrightnessAuto />
          ) : (
            <LightModeOutlined />
          )}
        </IconButton>
      </FormControl>
    )
  }
}
