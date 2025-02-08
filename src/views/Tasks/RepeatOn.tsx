import { FrequencyMetadata } from '@/models/task'
import { DAYS, MONTHS } from '@/utils/date'
import { FrequencyType, IntervalUnit, INTERVAL_UNITS } from '@/utils/recurrance'
import {
  Grid,
  Typography,
  Input,
  Select,
  Card,
  List,
  ListItem,
  Checkbox,
  Button,
  Box,
  Option,
} from '@mui/joy'
import moment from 'moment'
import React, { ChangeEvent } from 'react'

interface RepeatOnProps {
  frequencyType: FrequencyType
  frequency: number
  onFrequencyUpdate: (frequency: number) => void
  frequencyMetadata: FrequencyMetadata
  onFrequencyMetadataUpdate: (metadata: FrequencyMetadata) => void
  onFrequencyTimeUpdate: (time: string) => void
}

interface RepeatOnState {
  intervalUnit: IntervalUnit
}

export class RepeatOn extends React.Component<RepeatOnProps, RepeatOnState> {
  constructor(props: RepeatOnProps) {
    super(props)
    this.state = {
      intervalUnit: 'days',
    }
  }

  render(): React.ReactNode {
    const {
      frequencyType,
      frequency,
      onFrequencyUpdate,
      frequencyMetadata,
      onFrequencyMetadataUpdate,
      onFrequencyTimeUpdate,
    } = this.props
    const { intervalUnit } = this.state

    const timePickerComponent = (
      <Grid
        sm={12}
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <Typography>At: </Typography>
        <Input
          type='time'
          defaultValue={
            frequencyMetadata?.time
              ? moment(frequencyMetadata?.time).format('HH:mm')
              : '18:00'
          }
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
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
            <Grid
              sm={12}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
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
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  onFrequencyUpdate(parseInt(e.target.value))
                }}
              />
              <Select
                placeholder='Unit'
                value={intervalUnit}
              >
                {INTERVAL_UNITS.map(item => (
                  <Option
                    key={item}
                    value={item}
                    onClick={() => {
                      this.setState({ intervalUnit: item })
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
            <Grid
              sm={12}
              sx={{ display: 'flex', alignItems: 'center' }}
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
                  {DAYS.map(item => (
                    <ListItem key={item}>
                      <Checkbox
                        checked={
                          frequencyMetadata?.days?.includes(item) || false
                        }
                        onClick={() => {
                          const newDaysOfTheWeek =
                            frequencyMetadata['days'] || []
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
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const value = Math.min(
                    31,
                    Math.max(1, parseInt(e.target.value)),
                  )
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
