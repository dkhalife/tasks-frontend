import {
  Box,
  Button,
  Card,
  Checkbox,
  FormControl,
  FormHelperText,
  Grid,
  Input,
  List,
  ListItem,
  Option,
  Radio,
  RadioGroup,
  Select,
  Typography,
} from '@mui/joy'
import moment from 'moment'
import { useState } from 'react'
import React from 'react'

const FREQUANCY_TYPES_RADIOS = [
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'adaptive',
  'custom',
]

const FREQUENCY_TYPE_MESSAGE = {
  adaptive:
    'This chore will be scheduled dynamically based on previous completion dates.',
  custom: 'This chore will be scheduled based on a custom frequency.',
}
const REPEAT_ON_TYPE = ['interval', 'days_of_the_week', 'day_of_the_month']
const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
]

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

interface RepeatOnProps {
  frequencyType: string,
  frequency: number,
  onFrequencyUpdate: (frequency: number) => void,
  frequencyMetadata: any,
  onFrequencyMetadataUpdate: (metadata: any) => void,
  onFrequencyTimeUpdate: (time: string) => void,
}

export class RepeatOn extends React.Component<RepeatOnProps> {
  render(): React.ReactNode {
    const { frequencyType, frequency, onFrequencyUpdate, frequencyMetadata, onFrequencyMetadataUpdate, onFrequencyTimeUpdate } = this.props

    const [intervalUnit, setIntervalUnit] = useState('days')
    const timePickerComponent = (
      <Grid sm={12} sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography>At: </Typography>
        <Input
          type='time'
          defaultValue={
            frequencyMetadata?.time
              ? moment(frequencyMetadata?.time).format('HH:mm')
              : '18:00'
          }
          onChange={e => {
            onFrequencyTimeUpdate(
              moment(
                moment(new Date()).format('YYYY-MM-DD') + 'T' + e.target.value,
              ).format(),
            )
          }}
        />
      </Grid>
    )

    switch (frequencyType) {
      case 'interval':
        return (
          <>
            <Grid sm={12} sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography>Every: </Typography>
              <Input
                slotProps={{
                  input: {
                    min: 1,
                    max: 1000,
                  },
                }}
                type='number'
                value={frequency}
                onChange={e => {
                  onFrequencyUpdate(parseInt(e.target.value))
                }}
              />
              <Select placeholder='Unit' value={intervalUnit}>
                {['hours', 'days', 'weeks', 'months', 'years'].map(item => (
                  <Option
                    key={item}
                    value={item}
                    onClick={() => {
                      setIntervalUnit(item)
                      onFrequencyMetadataUpdate({
                        ...frequencyMetadata,
                        unit: item,
                      })
                    }}
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </Option>
                ))}
              </Select>
            </Grid>
            {timePickerComponent}
          </>
        )
      case 'days_of_the_week':
        return (
          <>
            <Grid sm={12} sx={{ display: 'flex', alignItems: 'center' }}>
              <Card>
                <List
                  orientation='horizontal'
                  wrap
                  sx={{
                    '--List-gap': '8px',
                    '--ListItem-radius': '20px',
                  }}
                >
                  {DAYS.map(item => (
                    <ListItem key={item}>
                      <Checkbox
                        checked={frequencyMetadata?.days?.includes(item) || false}
                        onClick={() => {
                          const newDaysOfTheWeek = frequencyMetadata['days'] || []
                          if (newDaysOfTheWeek.includes(item)) {
                            newDaysOfTheWeek.splice(
                              newDaysOfTheWeek.indexOf(item),
                              1,
                            )
                          } else {
                            newDaysOfTheWeek.push(item)
                          }

                          onFrequencyMetadataUpdate({
                            ...frequencyMetadata,
                            days: newDaysOfTheWeek.sort(),
                          })
                        }}
                        overlay
                        disableIcon
                        variant='soft'
                        label={item.charAt(0).toUpperCase() + item.slice(1)}
                      />
                    </ListItem>
                  ))}
                </List>
                <Button
                  size='sm'
                  variant='soft'
                  color='neutral'
                  onClick={() => {
                    if (frequencyMetadata?.days?.length === 7) {
                      onFrequencyMetadataUpdate({
                        ...frequencyMetadata,
                        days: [],
                      })
                    } else {
                      onFrequencyMetadataUpdate({
                        ...frequencyMetadata,
                        days: DAYS.map(item => item),
                      })
                    }
                  }}
                >
                  {frequencyMetadata?.days?.length === 7
                    ? 'Unselect All'
                    : 'Select All'}
                </Button>
              </Card>
            </Grid>
            {timePickerComponent}
          </>
        )
      case 'day_of_the_month':
        return (
          <>
            <Grid
              sm={12}
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Card>
                <List
                  orientation='horizontal'
                  wrap
                  sx={{
                    '--List-gap': '8px',
                    '--ListItem-radius': '20px',
                  }}
                >
                  {MONTHS.map(item => (
                    <ListItem key={item}>
                      <Checkbox
                        checked={frequencyMetadata?.months?.includes(item)}
                        onClick={() => {
                          const newMonthsOfTheYear =
                            frequencyMetadata['months'] || []
                          if (newMonthsOfTheYear.includes(item)) {
                            newMonthsOfTheYear.splice(
                              newMonthsOfTheYear.indexOf(item),
                              1,
                            )
                          } else {
                            newMonthsOfTheYear.push(item)
                          }

                          onFrequencyMetadataUpdate({
                            ...frequencyMetadata,
                            months: newMonthsOfTheYear.sort(),
                          })
                        }}
                        overlay
                        disableIcon
                        variant='soft'
                        label={item.charAt(0).toUpperCase() + item.slice(1)}
                      />
                    </ListItem>
                  ))}
                </List>
                <Button
                  size='sm'
                  variant='soft'
                  color='neutral'
                  onClick={() => {
                    if (frequencyMetadata?.months?.length === 12) {
                      onFrequencyMetadataUpdate({
                        ...frequencyMetadata,
                        months: [],
                      })
                    } else {
                      onFrequencyMetadataUpdate({
                        ...frequencyMetadata,
                        months: MONTHS.map(item => item),
                      })
                    }
                  }}
                >
                  {frequencyMetadata?.months?.length === 12
                    ? 'Unselect All'
                    : 'Select All'}
                </Button>
              </Card>
            </Grid>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 1.5,
              }}
            >
              <Typography>on the </Typography>
              <Input
                sx={{ width: '80px' }}
                type='number'
                value={frequency}
                onChange={e => {
                  const value = Math.min(31, Math.max(1, parseInt(e.target.value)))
                  onFrequencyUpdate(value)
                }}
              />
              <Typography>of the above month/s</Typography>
            </Box>
            {timePickerComponent}
          </>
        )

      default:
        return null
    }
  }
}

interface RepeatOptionProps {
  frequencyType: string,
  frequency: number,
  onFrequencyUpdate: (frequency: number) => void,
  onFrequencyTypeUpdate: (type: string) => void,
  frequencyMetadata: any,
  onFrequencyMetadataUpdate: (metadata: any) => void,
  onFrequencyTimeUpdate: (time: string) => void,
  frequencyError: string,
}

export class RepeatOption extends React.Component<RepeatOptionProps> {
  render(): React.ReactNode {
    const { frequencyType, frequency, onFrequencyUpdate, onFrequencyTypeUpdate, frequencyMetadata, onFrequencyMetadataUpdate, onFrequencyTimeUpdate, frequencyError } = this.props

    return (
      <Box mt={2}>
        <Typography level='h4'>Repeat :</Typography>
        <FormControl sx={{ mt: 1 }}>
          <Checkbox
            onChange={e => {
              onFrequencyTypeUpdate(e.target.checked ? 'daily' : 'once')
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
                {FREQUANCY_TYPES_RADIOS.map(item => (
                  <ListItem key={item}>
                    <Checkbox
                      checked={
                        item === frequencyType ||
                        (item === 'custom' &&
                          REPEAT_ON_TYPE.includes(frequencyType))
                      }
                      onClick={() => {
                        if (item === 'custom') {
                          onFrequencyTypeUpdate(REPEAT_ON_TYPE[0])
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
                          })

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
              <Typography>{FREQUENCY_TYPE_MESSAGE[frequencyType]}</Typography>
              {frequencyType === 'custom' ||
                (REPEAT_ON_TYPE.includes(frequencyType) && (
                  <>
                    <Grid container spacing={1} mt={2}>
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
                                  action: ({ checked }) => ({
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
                ))}
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
