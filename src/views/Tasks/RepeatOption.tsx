import { FrequencyMetadata } from '@/models/task'
import { FrequencyType, FREQUENCY_TYPES } from '@/utils/recurrance'
import {
  Box,
  Typography,
  FormControl,
  Checkbox,
  FormHelperText,
  Card,
  List,
  ListItem,
} from '@mui/joy'
import React, { ChangeEvent } from 'react'

interface RepeatOptionProps {
  frequencyType: FrequencyType
  frequency: number
  onFrequencyUpdate: (frequency: number) => void
  onFrequencyTypeUpdate: (type: FrequencyType) => void
  frequencyMetadata: FrequencyMetadata
  onFrequencyMetadataUpdate: (metadata: FrequencyMetadata) => void
  onFrequencyTimeUpdate: (time: string) => void
  frequencyError: string
}

export class RepeatOption extends React.Component<RepeatOptionProps> {
  private onRepeatToggle = (e: ChangeEvent<HTMLInputElement>): void => {
    this.props.onFrequencyTypeUpdate(e.target.checked ? 'interval' : 'once')
  }

  private onFrequencyTypeChhange = (evt: React.ChangeEvent<HTMLInputElement>, type: FrequencyType): void => {
    if (evt.target.checked) {
      this.props.onFrequencyTypeUpdate(type)
    } else {
      this.props.onFrequencyTypeUpdate('once')
    }
  }

  render(): React.ReactNode {
    const { frequencyType, frequencyError } = this.props
    const isRepeating = frequencyType !== 'once'

    return (
      <Box mt={2}>
        <Typography level='h4'>Repeat :</Typography>
        <FormControl sx={{
            mt: 1,
          }}>
          <Checkbox
            onChange={this.onRepeatToggle}
            checked={isRepeating}
            overlay
            label='Repeat this task'
          />
        </FormControl>
        {isRepeating && (
          <>
            <Card sx={{
                mt: 1,
              }}>
              <Typography>How often should it be repeated?</Typography>

              <List
                orientation='horizontal'
                wrap
                sx={{
                  '--List-gap': '8px',
                  '--ListItem-radius': '20px',
                }}
              >
                {FREQUENCY_TYPES.map((item: FrequencyType) => {
                  if (item === 'once') {
                    return null
                  }

                  return (
                    <ListItem key={item}>
                      <Checkbox
                        checked={item === frequencyType}
                        onChange={(evt) => this.onFrequencyTypeChhange(evt, item)}
                        overlay
                        disableIcon
                        variant='soft'
                        label={
                          item.charAt(0).toUpperCase() +
                          item.slice(1).replace(/_/g, ' ')
                        }
                      />
                    </ListItem>
                  )}
                )}
              </List>
              <FormControl error={Boolean(frequencyError)}>
                <FormHelperText>{frequencyError}</FormHelperText>
              </FormControl>
            </Card>
          </>
        )}
      </Box>
    )
  }
}
