import {
  DeleteTask,
  MarkTaskComplete,
  UpdateDueDate,
  SkipTask,
} from '@/api/tasks'
import {
  TASK_UPDATE_EVENT,
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
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from '@mui/joy'
import React from 'react'
import { ConfirmationModal } from '../Modals/Inputs/ConfirmationModal'
import { DateModal } from '../Modals/Inputs/DateModal'
import { SxProps } from '@mui/material'
import { goToTaskEdit, goToTask, goToTaskHistory } from '@/utils/navigation'

interface TaskCardProps {
  task: Task
  onTaskUpdate: (updatedTask: Task, event: TASK_UPDATE_EVENT) => void
  onTaskRemove: () => void
  sx: SxProps
  viewOnly: boolean
}

type TaskCardState = object

export class TaskCard extends React.Component<TaskCardProps, TaskCardState> {
  private menuRef = React.createRef<HTMLDivElement>()
  private confirmationModalRef = React.createRef<ConfirmationModal>()
  private dateModalRef = React.createRef<DateModal>()

  constructor(props: TaskCardProps) {
    super(props)
    this.state = {
    }
  }

  private handleDeleteConfirm = async (isConfirmed: boolean) => {
    const { task, onTaskRemove } = this.props
    if (isConfirmed === true) {
      await DeleteTask(task.id)
      onTaskRemove()
    }
  }

  private handleDelete = () => {
    this.confirmationModalRef.current?.open()
  }

  private handleTaskCompletion = async () => {
    const { task, onTaskUpdate } = this.props
    const response = await MarkTaskComplete(task.id, null)
    onTaskUpdate(response.task, 'completed')
  }

  private handleChangeDueDate = async (newDate: Date | null) => {
    if (newDate === null) {
      return
    }

    const { task, onTaskUpdate } = this.props

    const response = await UpdateDueDate(task.id, newDate)
    onTaskUpdate(response.task, 'rescheduled')
  }

  private handleCompleteWithPastDate = async (newDate: Date | null) => {
    if (newDate === null) {
      return
    }

    const { task, onTaskUpdate } = this.props

    const response = await MarkTaskComplete(task.id, newDate)
    onTaskUpdate(response.task, 'completed')
  }

  private getFrequencyIcon = (task: Task) => {
    if (['once', 'no_repeat'].includes(task.frequency_type)) {
      return <TimesOneMobiledata />
    } else if (task.frequency_type === 'trigger') {
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

    const response = await SkipTask(task.id)
    onTaskUpdate(response.task, 'skipped')
  }

  private onChangeDueDate = () => {
    this.dateModalRef.current?.open()
  }

  render(): React.ReactNode {
    const { task, sx, viewOnly } = this.props

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
          color={getDueDateChipColor(task.next_due_date)}
        >
          {getDueDateChipText(task.next_due_date)}
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
              xs={2}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Box
                display='flex'
                justifyContent='center'
                alignItems='center'
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
                  <MenuItem onClick={() => goToTaskEdit(task.id)}>
                    <Edit />
                    Edit
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={() => goToTaskHistory(task.id)}
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
            <Grid
              xs={9}
              onClick={() => goToTask(task.id)}
            >
              <Box
                display='flex'
                justifyContent='start'
                alignItems='center'
              >
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
          </Grid>
          <DateModal
            key={'changeDueDate' + task.id}
            current={task.next_due_date}
            title={`Change due date`}
            onClose={this.handleChangeDueDate}
          />
          <DateModal
            ref={this.dateModalRef}
            key={'completedInPast' + task.id}
            current={task.next_due_date}
            title={`Save Task that you completed in the past`}
            onClose={this.handleCompleteWithPastDate}
          />

          <ConfirmationModal
            ref={this.confirmationModalRef}
            title='Delete Task'
            confirmText='Delete'
            cancelText='Cancel'
            message='Are you sure you want to delete this task?'
            onClose={this.handleDeleteConfirm}
          />
        </Card>
      </Box>
    )
  }
}
