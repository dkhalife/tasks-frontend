import React from 'react'
import { Box, Typography, Divider, FormControl, Checkbox } from '@mui/joy'
import {
  featureFlagDefinitions,
  getFeatureFlag,
  setFeatureFlag,
} from '@/constants/featureFlags'

interface FeatureFlagSettingsProps {}

interface FeatureFlagSettingsState {
  flags: Record<string, boolean>
}

export class FeatureFlagSettings extends React.Component<
  FeatureFlagSettingsProps,
  FeatureFlagSettingsState
> {
  constructor(props: FeatureFlagSettingsProps) {
    super(props)

    const flags: Record<string, boolean> = {}
    featureFlagDefinitions.forEach(def => {
      flags[def.name] = getFeatureFlag(def.name, def.defaultValue)
    })

    this.state = { flags }
  }

  private onToggle = (name: string) => {
    const { flags } = this.state
    const next = !flags[name]
    this.setState({ flags: { ...flags, [name]: next } })
    setFeatureFlag(name, next)
  }

  render(): React.ReactNode {
    const { flags } = this.state
    return (
      <Box sx={{ mt: 2 }}>
        <Typography level='h3'>Feature Flags</Typography>
        <Divider />
        {featureFlagDefinitions.map(def => (
          <FormControl key={def.name} sx={{ mt: 1 }}>
            <Checkbox
              overlay
              checked={flags[def.name]}
              onChange={() => this.onToggle(def.name)}
              label={def.description}
            />
          </FormControl>
        ))}
      </Box>
    )
  }
}
