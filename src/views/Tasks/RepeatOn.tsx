import { DayOfTheWeek, Month, RepeatCustom } from '@/models/task'
import { dayOfMonthSuffix } from '@/utils/date'
import { INTERVAL_UNITS } from '@/utils/recurrance'
import {
  Grid,
  Typography,
  Input,
  Select,
  Card,
  List,
  ListItem,
  Checkbox,
  Box,
  Option,
} from '@mui/joy'
import moment from 'moment'
import React from 'react'

interface RepeatOnProps {
  nextDueDate: Date | null
  frequency: RepeatCustom
  onUpdate: () => void
}

type RepeatOnState = object

export class RepeatOn extends React.Component<RepeatOnProps, RepeatOnState> {
  constructor(props: RepeatOnProps) {
    super(props)
    this.state = {
    }
  }

  private onIntervalChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    // TODO
  }

  private onIntervalUnitChange = (evt: React.MouseEvent<HTMLElement>) => {
    // TODO
  }

  private onDayOfTheWeekChange = (day: DayOfTheWeek) => {
    // TODO
  }

  private onMonthChange = (month: Month) => {
    // TODO
  }

  render(): React.ReactNode {
    const { frequency, nextDueDate } = this.props
    const day = nextDueDate ? moment(nextDueDate).date() : 0

    switch (frequency.on) {
      case 'interval':
        return (
          <>
            <Grid
              sm={12}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <Typography>Every :&nbsp;</Typography>
              <Input
                slotProps={{
                  input: {
                    min: 1,
                    max: 365,
                  },
                }}
                type='number'
                sx={{
                  maxWidth: '75px',
                  mr: 1,
                }}
                value={frequency.interval}
                onChange={this.onIntervalChange}
              />
              <Select
                placeholder='Unit'
                value={frequency.type}
              >
                {INTERVAL_UNITS.map(item => (
                  <Option
                    key={item}
                    value={item}
                    onClick={this.onIntervalUnitChange}
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </Option>
                ))}
              </Select>
            </Grid>
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
                    {[...Array(7).keys()].map(item => (
                    <ListItem key={item}>
                      <Checkbox
                      checked={
                        frequency.days.includes(item as DayOfTheWeek) || false
                      }
                      onClick={() => this.onDayOfTheWeekChange(item as DayOfTheWeek)}
                      overlay
                      disableIcon
                      variant='soft'
                      label={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][item]}
                      />
                    </ListItem>
                    ))}
                </List>
              </Card>
            </Grid>
          </>
        )
      case 'days_of_the_month':
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
                  {[...Array(12).keys()].map(item => (
                    <ListItem key={item}>
                      <Checkbox
                        checked={frequency.months.includes(item as Month)}
                        onClick={() => this.onMonthChange(item as Month)}
                        overlay
                        disableIcon
                        variant='soft'
                        label={moment().month(item).format('MMM')}
                      />
                    </ListItem>
                  ))}
                </List>
              </Card>
            </Grid>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 1.5,
              }}
            >
              <Typography>on the {day}{dayOfMonthSuffix(day)} of the above month(s)</Typography>
            </Box>
          </>
        )

      default:
        return null
    }
  }
}
