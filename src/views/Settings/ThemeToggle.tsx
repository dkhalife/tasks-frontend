import { ThemeMode } from '@/constants/theme'
import {
  LightModeOutlined,
  DarkModeOutlined,
  LaptopOutlined,
} from '@mui/icons-material'
import { FormControl, FormLabel, ToggleButtonGroup, Button, Box } from '@mui/joy'
import React from 'react'

interface ThemeToggleProps {
  themeMode: ThemeMode
  onThemeModeToggle: (newTheme: ThemeMode) => void
}

export class ThemeToggle extends React.Component<ThemeToggleProps> {
  private onChange = (_: React.MouseEvent, newThemeMode: ThemeMode | null) => {
    if (!newThemeMode) {
      return
    }

    this.props.onThemeModeToggle(newThemeMode)
  }

  render(): React.ReactNode {
    const ELEMENTID = 'select-theme-mode'
    const { themeMode } = this.props

    return (
      <Box sx={{
        mt: 1,
      }}>
        <ToggleButtonGroup
          id={ELEMENTID}
          variant='outlined'
          value={themeMode}
          onChange={this.onChange}
        >
          <Button
            startDecorator={<LightModeOutlined />}
            value='light'
          >
            Light
          </Button>
          <Button
            startDecorator={<DarkModeOutlined />}
            value='dark'
          >
            Dark
          </Button>
          <Button
            startDecorator={<LaptopOutlined />}
            value='system'
          >
            System
          </Button>
        </ToggleButtonGroup>
      </Box>
    )
  }
}
