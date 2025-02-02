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
import React from 'react'
import { getTextColorFromBackgroundColor } from '../../utils/Colors'
import { ConfirmationModal, ConfirmationModalProps } from '../Modals/Inputs/ConfirmationModal'
import { DateModal } from '../Modals/Inputs/DateModal'
import { SxProps } from '@mui/joy/styles/types'
import { withNavigation } from '../../contexts/hooks'
import { Chore, getDueDateChipColor, getDueDateChipText, getRecurrentChipText } from '../../models/chore'
import { DeleteChore, MarkChoreComplete, UpdateDueDate, SkipChore } from '../../api/chores'

interface ChoreCardProps {
  chore: Chore
  onChoreUpdate: (chore: Chore, event: string) => void
  onChoreRemove: (chore: Chore) => void
  sx: SxProps
  viewOnly: boolean
  navigate: (path: string) => void
}

interface ChoreCardState {
  isCompleteWithPastDateModalOpen: boolean
  confirmModelConfig: ConfirmationModalProps | null
}

class ChoreCardInner extends React.Component<ChoreCardProps, ChoreCardState> {
  private menuRef = React.createRef<HTMLDivElement>()
  private confirmationModalRef = React.createRef<ConfirmationModal>()
  private dateModalRef = React.createRef<DateModal>()

  constructor(props: ChoreCardProps) {
    super(props)

    this.state = {
      isCompleteWithPastDateModalOpen: false,
      confirmModelConfig: null,
    }
  }

  private handleEdit = () => {
    this.props.navigate(`/chores/${this.props.chore.id}/edit`)
  }

  private handleDeleteConfirm = async (isConfirmed: boolean) => {
    const { chore, onChoreRemove } = this.props
    if (isConfirmed === true) {
      await DeleteChore(chore.id)
      onChoreRemove(chore)
    }

    this.setState({ confirmModelConfig: null })
  }

  private handleDelete = () => {
    this.setState({
      confirmModelConfig: {
        title: 'Delete Chore',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        message: 'Are you sure you want to delete this chore?',
        onClose: this.handleDeleteConfirm,
      },
    })
  }

  private handleTaskCompletion = () => {
    const { chore, onChoreUpdate } = this.props
    MarkChoreComplete(chore.id, null).then(data => {
      onChoreUpdate(data.res, 'completed')
    })
  }

  private handleChangeDueDate = (newDate: string | null) => {
    if (newDate === null) {
      return
    }

    const { chore, onChoreUpdate } = this.props

    UpdateDueDate(chore.id, new Date(newDate)).then(data => {
      const newChore = data.res
      onChoreUpdate(newChore, 'rescheduled')
    })
  }

  private handleCompleteWithPastDate = (newDate: string | null) => {
    if (newDate === null) {
      return
    }

    const { chore, onChoreUpdate } = this.props

    MarkChoreComplete(chore.id, new Date(newDate)).then((data) => {
      onChoreUpdate(data.res, 'completed')
    })
  }

  private getFrequencyIcon = (chore: Chore) => {
      if (['once', 'no_repeat'].includes(chore.frequencyType)) {
          return <TimesOneMobiledata />
      } else if (chore.frequencyType === 'trigger') {
          return <Webhook />
      } else {
          return <Repeat />
      }
  }

  private getName = (name: string) => {
    const split = Array.from<string>(this.props.chore.title)
    // if the first character is emoji then remove it from the name
    if (/\p{Emoji}/u.test(split[0])) {
      return split.slice(1).join('').trim()
    }
    return name
  }

  private onSkipChore = async () => {
    const { chore, onChoreUpdate } = this.props

    const data = await SkipChore(chore.id)
    const newChore = data.res
    onChoreUpdate(newChore, 'skipped')
  }

  render(): React.ReactNode {
    const { chore, sx, viewOnly } = this.props
    const {
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
          color={getDueDateChipColor(chore.nextDueDate)}
        >
          {getDueDateChipText(chore.nextDueDate)}
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
            {getRecurrentChipText(chore)}
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
                  <MenuItem onClick={this.onSkipChore}>
                    <SwitchAccessShortcut />
                    Skip to next due date
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      this.confirmationModalRef.current?.open()
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
            key={'changeDueDate' + chore.id}
            current={chore.nextDueDate}
            title={`Change due date`}
            onClose={this.handleChangeDueDate}
          />
          <DateModal
            ref={this.dateModalRef}
            key={'completedInPast' + chore.id}
            current={chore.nextDueDate}
            title={`Save Chore that you completed in the past`}
            onClose={this.handleCompleteWithPastDate}
          />

          { confirmModelConfig && (
            <ConfirmationModal
              ref={this.confirmationModalRef}
              {...confirmModelConfig}
              />
          )}
        </Card>
      </Box>
    )
  }
}

export const ChoreCard = withNavigation(ChoreCardInner)
