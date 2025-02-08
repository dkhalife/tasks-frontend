import {
  DeleteTask,
  MarkTaskComplete,
  UpdateDueDate,
  SkipTask,
} from '@/api/tasks'
import { withNavigation } from '@/contexts/hooks'
import {
  Task,
  getDueDateChipColor,
  getDueDateChipText,
  getRecurrentChipText,
} from '@/models/task'
import { getTextColorFromBackgroundColor } from '@/utils/Colors'
import {
  TimesOneMobiledata,
  Webhook,
  Repeat,
  Check,
  MoreVert,
  SwitchAccessShortcut,
  MoreTime,
  Edit,
  ManageSearch,
  Delete,
} from '@mui/icons-material'
import {
  Box,
  Chip,
  Card,
  Grid,
  Avatar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from '@mui/joy'
import React from 'react'
import {
  ConfirmationModalProps,
  ConfirmationModal,
} from '../Modals/Inputs/ConfirmationModal'
import { DateModal } from '../Modals/Inputs/DateModal'
import { SxProps } from '@mui/material'

interface TaskCardProps {
  task: Task
  onTaskUpdate: (task: Task, event: string) => void
  onTaskRemove: (task: Task) => void
  sx: SxProps
  viewOnly: boolean
  navigate: (path: string) => void
}

interface TaskCardState {
  isCompleteWithPastDateModalOpen: boolean
  confirmModelConfig: ConfirmationModalProps | null
}

class TaskCardInner extends React.Component<TaskCardProps, TaskCardState> {
  private menuRef = React.createRef<HTMLDivElement>()
  private confirmationModalRef = React.createRef<ConfirmationModal>()
  private dateModalRef = React.createRef<DateModal>()

  constructor(props: TaskCardProps) {
    super(props)

    this.state = {
      isCompleteWithPastDateModalOpen: false,
      confirmModelConfig: null,
    }
  }

  private handleEdit = () => {
    this.props.navigate(`/tasks/${this.props.task.id}/edit`)
  }

  private handleDeleteConfirm = async (isConfirmed: boolean) => {
    const { task, onTaskRemove } = this.props
    if (isConfirmed === true) {
      await DeleteTask(task.id)
      onTaskRemove(task)
    }

    this.setState({ confirmModelConfig: null })
  }

  private handleDelete = () => {
    this.setState({
      confirmModelConfig: {
        title: 'Delete Task',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        message: 'Are you sure you want to delete this task?',
        onClose: this.handleDeleteConfirm,
      },
    })
  }

  private handleTaskCompletion = async () => {
    const { task, onTaskUpdate } = this.props
    const data = await MarkTaskComplete(task.id, null)
    onTaskUpdate(data.task, 'completed')
  }

  private handleChangeDueDate = async (newDate: string | null) => {
    if (newDate === null) {
      return
    }

    const { task, onTaskUpdate } = this.props

    const data = await UpdateDueDate(task.id, new Date(newDate))
    onTaskUpdate(data.task, 'rescheduled')
  }

  private handleCompleteWithPastDate = async (newDate: string | null) => {
    if (newDate === null) {
      return
    }

    const { task, onTaskUpdate } = this.props

    const data = await MarkTaskComplete(task.id, new Date(newDate))
    onTaskUpdate(data.task, 'completed')
  }

  private getFrequencyIcon = (task: Task) => {
    if (['once', 'no_repeat'].includes(task.frequencyType)) {
      return <TimesOneMobiledata />
    } else if (task.frequencyType === 'trigger') {
      return <Webhook />
    } else {
      return <Repeat />
    }
  }

  private getName = (name: string) => {
    const split = Array.from<string>(this.props.task.title)
    // if the first character is emoji then remove it from the name
    if (/\p{Emoji}/u.test(split[0])) {
      return split.slice(1).join('').trim()
    }
    return name
  }

  private onSkipTask = async () => {
    const { task, onTaskUpdate } = this.props

    const data = await SkipTask(task.id)
    const newTask = data.res
    onTaskUpdate(newTask, 'skipped')
  }

  private goToTask = (taskId: string) => {
    this.props.navigate(`/tasks/${taskId}`)
  }

  private onChangeDueDate = () => {
    this.confirmationModalRef.current?.open()
  }

  render(): React.ReactNode {
    const { task, sx, viewOnly } = this.props
    const { confirmModelConfig } = this.state

    return (
      <Box key={task.id + '-box'}>
        <Chip
          variant='soft'
          sx={{
            position: 'relative',
            top: 10,
            zIndex: 1,
            left: 10,
          }}
          color={getDueDateChipColor(task.nextDueDate)}
        >
          {getDueDateChipText(task.nextDueDate)}
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
            {this.getFrequencyIcon(task)}
            {getRecurrentChipText(task)}
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
            key: `${task.id}-card`,
          }}
        >
          <Grid container>
            <Grid
              xs={9}
              onClick={() => this.goToTask(task.id)}
            >
              <Box
                display='flex'
                justifyContent='start'
                alignItems='center'
              >
                <Avatar sx={{ mr: 1, fontSize: 22 }}>
                  {Array.from<string>(task.title)[0]}
                </Avatar>
                <Box
                  display='flex'
                  flexDirection='column'
                >
                  <Typography level='title-md'>
                    {this.getName(task.title)}
                  </Typography>
                  <Box key={`${task.id}-labels`}>
                    {task.labels?.map((l, index) => {
                      return (
                        <Chip
                          variant='solid'
                          key={`taskcard-${task.id}-label-${l.id}`}
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
                  <div style={{ position: 'relative', alignItems: 'center' }}>
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
                  <MenuItem onClick={this.onSkipTask}>
                    <SwitchAccessShortcut />
                    Skip to next due date
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={this.onChangeDueDate}
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
                      this.props.navigate(`/tasks/${task.id}/history`)
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
            key={'changeDueDate' + task.id}
            current={task.nextDueDate}
            title={`Change due date`}
            onClose={this.handleChangeDueDate}
          />
          <DateModal
            ref={this.dateModalRef}
            key={'completedInPast' + task.id}
            current={task.nextDueDate}
            title={`Save Task that you completed in the past`}
            onClose={this.handleCompleteWithPastDate}
          />

          {confirmModelConfig && (
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

export const TaskCard = withNavigation(TaskCardInner)
