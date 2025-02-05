import {
  Box,
  Card,
  Checkbox,
  FormControl,
  FormHelperText,
  List,
  ListItem,
  Typography,
} from '@mui/joy'
import React, { ChangeEvent } from 'react'
import { FrequencyMetadata } from '../../models/task'
import { FREQUENCY_TYPES, FrequencyType } from '../../utils/recurrance'

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
  render(): React.ReactNode {
    const {
      frequencyType,
      onFrequencyTypeUpdate,
      frequencyError,
    } = this.props

    return (
      <Box mt={2}>
        <Typography level='h4'>Repeat :</Typography>
        <FormControl sx={{ mt: 1 }}>
          <Checkbox
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              onFrequencyTypeUpdate(e.target.checked ? 'interval' : 'once')
            }}
            defaultChecked={!['once', 'trigger'].includes(frequencyType)}
            overlay
            label='Repeat this task'
          />
          <FormHelperText>
            Is this something needed to be done regularly?
          </FormHelperText>
        </FormControl>
        {!['once', 'trigger'].includes(frequencyType) && (
          <>
            <Card sx={{ mt: 1 }}>
              <Typography>How often should it be repeated?</Typography>

              <List
                orientation='horizontal'
                wrap
                sx={{
                  '--List-gap': '8px',
                  '--ListItem-radius': '20px',
                }}
              >
                {FREQUENCY_TYPES.map((item: FrequencyType) => (
                  <ListItem key={item}>
                    <Checkbox
                      checked={item === frequencyType}
                      onClick={() => {
                        if (item === 'custom') {
                          /*onFrequencyTypeUpdate(INTERVAL_UNITS[0])
                          onFrequencyUpdate(1)
                          onFrequencyMetadataUpdate({
                            unit: 'days',
                            time: frequencyMetadata?.time
                              ? frequencyMetadata?.time
                              : moment(
                                  moment(new Date()).format('YYYY-MM-DD') +
                                    'T' +
                                    '18:00',
                                ).format(),
                          })*/

                          return
                        }
                        onFrequencyTypeUpdate(item)
                      }}
                      overlay
                      disableIcon
                      variant='soft'
                      label={
                        item.charAt(0).toUpperCase() +
                        item.slice(1).replace('_', ' ')
                      }
                    />
                  </ListItem>
                ))}
              </List>
              {/*frequencyType === 'custom' ||
                (REPEAT_ON_TYPE.includes(frequencyType) && (
                  <>
                    <Grid
                      container
                      spacing={1}
                      mt={2}
                    >
                      <Grid>
                        <Typography>Repeat on:</Typography>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                        >
                          <RadioGroup
                            orientation='horizontal'
                            aria-labelledby='segmented-controls-example'
                            name='justify'
                            sx={{
                              minHeight: 48,
                              padding: '4px',
                              borderRadius: '12px',
                              bgcolor: 'neutral.softBg',
                              '--RadioGroup-gap': '4px',
                              '--Radio-actionRadius': '8px',
                              mb: 1,
                            }}
                          >
                            {REPEAT_ON_TYPE.map(item => (
                              <Radio
                                key={item}
                                color='neutral'
                                checked={item === frequencyType}
                                onClick={() => {
                                  if (
                                    item === 'day_of_the_month' ||
                                    item === 'interval'
                                  ) {
                                    onFrequencyUpdate(1)
                                  }
                                  onFrequencyTypeUpdate(item)
                                  if (item === 'days_of_the_week') {
                                    onFrequencyMetadataUpdate({
                                      ...frequencyMetadata,
                                      days: [],
                                    })
                                  } else if (item === 'day_of_the_month') {
                                    onFrequencyMetadataUpdate({
                                      ...frequencyMetadata,
                                      months: [],
                                    })
                                  } else if (item === 'interval') {
                                    onFrequencyMetadataUpdate({
                                      ...frequencyMetadata,
                                      unit: 'days',
                                    })
                                  }
                                }}
                                value={item}
                                disableIcon
                                label={item
                                  .split('_')
                                  .map((i, idx) => {
                                    if (
                                      idx === 0 ||
                                      idx === item.split('_').length - 1
                                    ) {
                                      return (
                                        i.charAt(0).toUpperCase() + i.slice(1)
                                      )
                                    }
                                    return i
                                  })
                                  .join(' ')}
                                variant='plain'
                                sx={{
                                  px: 2,
                                  alignItems: 'center',
                                }}
                                slotProps={{
                                  action: ({ checked }: { checked: boolean}) => ({
                                    sx: {
                                      ...(checked && {
                                        bgcolor: 'background.surface',
                                        boxShadow: 'sm',
                                        '&:hover': {
                                          bgcolor: 'background.surface',
                                        },
                                      }),
                                    },
                                  }),
                                }}
                              />
                            ))}
                          </RadioGroup>
                        </Box>
                      </Grid>

                      <RepeatOn
                        frequency={frequency}
                        onFrequencyUpdate={onFrequencyUpdate}
                        frequencyType={frequencyType}
                        frequencyMetadata={frequencyMetadata || {}}
                        onFrequencyMetadataUpdate={onFrequencyMetadataUpdate}
                        onFrequencyTimeUpdate={onFrequencyTimeUpdate}
                      />
                    </Grid>
                  </>
                ))*/}
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
