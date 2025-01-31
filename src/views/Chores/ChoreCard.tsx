import {
  Check,
  Delete,
  Edit,
  ManageSearch,
  MoreTime,
  MoreVert,
  Repeat,
  SwitchAccessShortcut,
  TimesOneMobiledata,
  Webhook,
} from '@mui/icons-material'
import {
  Avatar,
  Box,
  Card,
  Chip,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/joy'
import moment from 'moment'
import React from 'react'
import { getTextColorFromBackgroundColor } from '../../utils/Colors'
import {
  DeleteChore,
  MarkChoreComplete,
  SkipChore,
  UpdateDueDate,
} from '../../utils/Fetcher'
import { ConfirmationModal, ConfirmationModalProps } from '../Modals/Inputs/ConfirmationModal'
import { DateModal } from '../Modals/Inputs/DateModal'
import { SxProps } from '@mui/joy/styles/types'
import { withNavigation } from '../../contexts/hooks'
import { Chore } from '../../models/chore'

interface ChoreCardProps {
  chore: Chore
  onChoreUpdate: (chore: Chore, event: string) => void
  onChoreRemove: (chore: Chore) => void
  sx: SxProps
  viewOnly: boolean
  navigate: (path: string) => void
}

interface ChoreCardState {
  isChangeDueDateModalOpen: boolean
  isCompleteWithPastDateModalOpen: boolean
  confirmModelConfig: ConfirmationModalProps | null
}

class ChoreCardInner extends React.Component<ChoreCardProps, ChoreCardState> {
  private menuRef = React.createRef<HTMLDivElement>()

  constructor(props: ChoreCardProps) {
    super(props)

    this.state = {
      isChangeDueDateModalOpen: false,
      isCompleteWithPastDateModalOpen: false,
      confirmModelConfig: null,
    }
  }

  private handleEdit = () => {
    this.props.navigate(`/chores/${this.props.chore.id}/edit`)
  }

  private handleDelete = () => {
    this.setState({
      confirmModelConfig: {
        isOpen: true,
        title: 'Delete Chore',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        message: 'Are you sure you want to delete this chore?',
        onClose: isConfirmed => {
          const { chore, onChoreRemove } = this.props
          if (isConfirmed === true) {
            DeleteChore(chore.id).then(response => {
              if (response.ok) {
                onChoreRemove(chore)
              }
            })
          }
          this.setState({ confirmModelConfig: null })
        },
      },
    })
  }

  private handleTaskCompletion = () => {
    const { chore, onChoreUpdate } = this.props
    MarkChoreComplete(chore.id, null, null).then(resp => {
      if (resp.ok) {
        return resp.json().then(data => {
          onChoreUpdate(data.res, 'completed')
        })
      }
    })
  }

  private handleChangeDueDate = newDate => {
    const { chore, onChoreUpdate } = this.props

    UpdateDueDate(chore.id, newDate).then(response => {
      if (response.ok) {
        response.json().then(data => {
          const newChore = data.res
          onChoreUpdate(newChore, 'rescheduled')
        })
      }
    })
  }

  private handleCompleteWithPastDate = newDate => {
    const { chore, onChoreUpdate } = this.props

    MarkChoreComplete(chore.id, null, new Date(newDate).toISOString()).then(
      response => {
        if (response.ok) {
          response.json().then(data => {
            const newChore = data.res
            onChoreUpdate(newChore, 'completed')
          })
        }
      },
    )
  }

  private getDueDateChipText = nextDueDate => {
    if (this.props.chore.nextDueDate === null) return 'No Due Date'
    // if due in next 48 hours, we should it in this format : Tomorrow 11:00 AM
    const diff = moment(nextDueDate).diff(moment(), 'hours')
    if (diff < 48 && diff > 0) {
      return moment(nextDueDate).calendar().replace(' at', '')
    }
    return 'Due ' + moment(nextDueDate).fromNow()
  }

  private getDueDateChipColor = nextDueDate => {
    if (this.props.chore.nextDueDate === null) return 'neutral'
    const diff = moment(nextDueDate).diff(moment(), 'hours')
    if (diff < 48 && diff > 0) {
      return 'warning'
    }
    if (diff < 0) {
      return 'danger'
    }

    return 'neutral'
  }

  private getRecurrentChipText = chore => {
    const dayOfMonthSuffix = n => {
      if (n >= 11 && n <= 13) {
        return 'th'
      }
      switch (n % 10) {
        case 1:
          return 'st'
        case 2:
          return 'nd'
        case 3:
          return 'rd'
        default:
          return 'th'
      }
    }
    if (chore.frequencyType === 'once') {
      return 'Once'
    } else if (chore.frequencyType === 'trigger') {
      return 'Trigger'
    } else if (chore.frequencyType === 'daily') {
      return 'Daily'
    } else if (chore.frequencyType === 'adaptive') {
      return 'Adaptive'
    } else if (chore.frequencyType === 'weekly') {
      return 'Weekly'
    } else if (chore.frequencyType === 'monthly') {
      return 'Monthly'
    } else if (chore.frequencyType === 'yearly') {
      return 'Yearly'
    } else if (chore.frequencyType === 'days_of_the_week') {
      let days = JSON.parse(chore.frequencyMetadata).days
      if (days.length > 4) {
        const allDays = [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ]
        const selectedDays = days.map(d => moment().day(d).format('dddd'))
        const notSelectedDay = allDays.filter(
          day => !selectedDays.includes(day),
        )
        const notSelectedShortdays = notSelectedDay.map(d =>
          moment().day(d).format('ddd'),
        )
        return `Daily except ${notSelectedShortdays.join(', ')}`
      } else {
        days = days.map(d => moment().day(d).format('ddd'))
        return days.join(', ')
      }
    } else if (chore.frequencyType === 'day_of_the_month') {
      const months = JSON.parse(chore.frequencyMetadata).months
      if (months.length > 6) {
        const allMonths = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ]
        const selectedMonths = months.map(m => moment().month(m).format('MMMM'))
        const notSelectedMonth = allMonths.filter(
          month => !selectedMonths.includes(month),
        )
        const notSelectedShortMonths = notSelectedMonth.map(m =>
          moment().month(m).format('MMM'),
        )
        return `${chore.frequency}${dayOfMonthSuffix(
          chore.frequency,
        )} except ${notSelectedShortMonths.join(', ')}`
      } else {
        const freqData = JSON.parse(chore.frequencyMetadata)
        const months = freqData.months.map(m => moment().month(m).format('MMM'))
        return `${chore.frequency}${dayOfMonthSuffix(
          chore.frequency,
        )} of ${months.join(', ')}`
      }
    } else if (chore.frequencyType === 'interval') {
      return `Every ${chore.frequency} ${
        JSON.parse(chore.frequencyMetadata).unit
      }`
    } else {
      return chore.frequencyType
    }
  }

  private getFrequencyIcon = chore => {
    if (['once', 'no_repeat'].includes(chore.frequencyType)) {
      return <TimesOneMobiledata />
    } else if (chore.frequencyType === 'trigger') {
      return <Webhook />
    } else {
      return <Repeat />
    }
  }

  private getName = name => {
    const split = Array.from<string>(this.props.chore.title)
    // if the first character is emoji then remove it from the name
    if (/\p{Emoji}/u.test(split[0])) {
      return split.slice(1).join('').trim()
    }
    return name
  }

  render(): React.ReactNode {
    const { chore, onChoreUpdate, sx, viewOnly } = this.props
    const {
      isChangeDueDateModalOpen,
      isCompleteWithPastDateModalOpen,
      confirmModelConfig,
    } = this.state

    return (
      <Box key={chore.id + '-box'}>
        <Chip
          variant='soft'
          sx={{
            position: 'relative',
            top: 10,
            zIndex: 1,
            left: 10,
          }}
          color={this.getDueDateChipColor(chore.nextDueDate)}
        >
          {this.getDueDateChipText(chore.nextDueDate)}
        </Chip>

        <Chip
          variant='soft'
          sx={{
            position: 'relative',
            top: 10,
            zIndex: 1,
            ml: 0.4,
            left: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {this.getFrequencyIcon(chore)}
            {this.getRecurrentChipText(chore)}
          </div>
        </Chip>

        <Card
          style={viewOnly ? { pointerEvents: 'none' } : {}}
          variant='plain'
          sx={{
            ...sx,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 2,
            boxShadow: 'sm',
            borderRadius: 20,
            key: `${chore.id}-card`,
          }}
        >
          <Grid container>
            <Grid
              xs={9}
              onClick={() => {
                this.props.navigate(`/chores/${chore.id}`)
              }}
            >
              <Box
                display='flex'
                justifyContent='start'
                alignItems='center'
              >
                <Avatar sx={{ mr: 1, fontSize: 22 }}>
                  {Array.from<string>(chore.title)[0]}
                </Avatar>
                <Box
                  display='flex'
                  flexDirection='column'
                >
                  <Typography level='title-md'>
                    {this.getName(chore.title)}
                  </Typography>
                  <Box key={`${chore.id}-labels`}>
                    {chore.labels?.map((l, index) => {
                      return (
                        <Chip
                          variant='solid'
                          key={`chorecard-${chore.id}-label-${l.id}`}
                          color='primary'
                          sx={{
                            position: 'relative',
                            ml: index === 0 ? 0 : 0.5,
                            top: 2,
                            zIndex: 1,
                            backgroundColor: `${l?.color} !important`,
                            color: getTextColorFromBackgroundColor(l?.color),
                          }}
                        >
                          {l?.name}
                        </Chip>
                      )
                    })}
                  </Box>
                </Box>
              </Box>
            </Grid>
            <Grid
              xs={3}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Box
                display='flex'
                justifyContent='flex-end'
                alignItems='flex-end'
              >
                <IconButton
                  variant='solid'
                  color='success'
                  onClick={this.handleTaskCompletion}
                  sx={{
                    borderRadius: '50%',
                    minWidth: 50,
                    height: 50,
                    zIndex: 1,
                  }}
                >
                  <div className='relative grid place-items-center'>
                    <Check />
                  </div>
                </IconButton>
                <IconButton
                  variant='soft'
                  color='success'
                  sx={{
                    borderRadius: '50%',
                    width: 25,
                    height: 25,
                    position: 'relative',
                    left: -10,
                  }}
                >
                  <MoreVert />
                </IconButton>
                <Menu
                  size='lg'
                  ref={this.menuRef}
                >
                  <MenuItem
                    onClick={() => {
                      SkipChore(chore.id).then(response => {
                        if (response.ok) {
                          response.json().then(data => {
                            const newChore = data.res
                            onChoreUpdate(newChore, 'skipped')
                          })
                        }
                      })
                    }}
                  >
                    <SwitchAccessShortcut />
                    Skip to next due date
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      this.setState({ isCompleteWithPastDateModalOpen: true })
                    }}
                  >
                    <MoreTime />
                    Change due date
                  </MenuItem>
                  <MenuItem onClick={this.handleEdit}>
                    <Edit />
                    Edit
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      this.props.navigate(`/chores/${chore.id}/history`)
                    }}
                  >
                    <ManageSearch />
                    History
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={this.handleDelete}
                    color='danger'
                  >
                    <Delete />
                    Delete
                  </MenuItem>
                </Menu>
              </Box>
            </Grid>
          </Grid>
          <DateModal
            isOpen={isChangeDueDateModalOpen}
            key={'changeDueDate' + chore.id}
            current={chore.nextDueDate}
            title={`Change due date`}
            onClose={() => {
              this.setState({ isChangeDueDateModalOpen: false })
            }}
            onSave={this.handleChangeDueDate}
          />
          <DateModal
            isOpen={isCompleteWithPastDateModalOpen}
            key={'completedInPast' + chore.id}
            current={chore.nextDueDate}
            title={`Save Chore that you completed in the past`}
            onClose={() => {
              this.setState({ isCompleteWithPastDateModalOpen: false })
            }}
            onSave={this.handleCompleteWithPastDate}
          />

          {confirmModelConfig?.isOpen && (
            <ConfirmationModal {...confirmModelConfig} />
          )}
        </Card>
      </Box>
    )
  }
}

export const ChoreCard = withNavigation(ChoreCardInner)
