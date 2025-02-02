import {
  BrightnessAuto,
  DarkModeOutlined,
  LightModeOutlined,
} from '@mui/icons-material'
import { FormControl, IconButton } from '@mui/joy'
import { SxProps } from '@mui/joy/styles/types'
import React from 'react'
import { ThemeMode } from '../../constants/theme'

interface ThemeToggleButtonProps {
  sx: SxProps
  themeMode: ThemeMode
  onThemeModeToggle: () => void
}

export class ThemeToggleButton extends React.Component<ThemeToggleButtonProps> {
  private onClick = (e: MouseEvent) => {
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
