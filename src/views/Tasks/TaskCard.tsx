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
import { getTextColorFromBackgroundColor } from '@/utils/colors'
import {
  TimesOneMobiledata,
  Repeat,
  Check,
  MoreVert,
  SwitchAccessShortcut,
  MoreTime,
  Edit,
  ManageSearch,
  Delete,
  NotificationsActive,
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
import { NavigationPaths, WithNavigate } from '@/utils/navigation'

type TaskCardProps = WithNavigate & {
  task: Task
  onTaskUpdate: (updatedTask: Task, event: TASK_UPDATE_EVENT) => void
  onTaskRemove: () => void
  viewOnly: boolean
}

interface TaskCardState {
  isMoreMenuOpen: boolean
}

export class TaskCard extends React.Component<TaskCardProps, TaskCardState> {
  private menuRef = React.createRef<HTMLDivElement>()
  private moreMenuRef = React.createRef<HTMLAnchorElement>()
  private confirmationModalRef = React.createRef<ConfirmationModal>()
  private dateModalRef = React.createRef<DateModal>()

  constructor(props: TaskCardProps) {
    super(props)
    this.state = {
      isMoreMenuOpen: false,
    }
  }

  private handleMoreMenu = () => {
    this.setState({
      isMoreMenuOpen: !this.state.isMoreMenuOpen,
    })
  }

  private dismissMoreMenu = () => {
    this.setState({
      isMoreMenuOpen: false,
    })
  }

  private handleDeleteConfirm = async (isConfirmed: boolean) => {
    const { task, onTaskRemove } = this.props
    if (isConfirmed === true) {
      await DeleteTask(task.id)
      onTaskRemove()
    }
  }

  private handleEdit = (taskId: string) => {
    this.dismissMoreMenu()
    this.props.navigate(NavigationPaths.TaskEdit(taskId))
  }

  private handleHistory = (taskId: string) => {
    this.dismissMoreMenu()
    this.props.navigate(NavigationPaths.TaskHistory(taskId))
  }

  private handleDelete = () => {
    this.dismissMoreMenu()
    this.confirmationModalRef.current?.open()
  }

  private handleTaskCompletion = async () => {
    const { task, onTaskUpdate } = this.props
    const response = await MarkTaskComplete(task.id)
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

  private getFrequencyIcon = (task: Task) => {
    if (task.frequency.type === 'once') {
      return <TimesOneMobiledata />
    } else {
      return <Repeat />
    }
  }

  private onSkipTask = async () => {
    this.dismissMoreMenu()

    const { task, onTaskUpdate } = this.props
    const response = await SkipTask(task.id)
    onTaskUpdate(response.task, 'skipped')
  }

  private onChangeDueDate = () => {
    this.dismissMoreMenu()
    this.dateModalRef.current?.open(this.props.task.next_due_date)
  }

  private hasAnyNotificationsActive = () => {
    const { task } = this.props
    if (!task.notification.enabled) {
      return false
    }

    const notifications = task.notification
    return (
      notifications.due_date || notifications.overdue || notifications.pre_due
    )
  }

  render(): React.ReactNode {
    const { task, viewOnly, navigate } = this.props
    const { isMoreMenuOpen } = this.state

    const notificationsActive = this.hasAnyNotificationsActive()

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
            {getRecurrentChipText(task.next_due_date, task.frequency)}
          </div>
        </Chip>

        {notificationsActive && (
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
              <NotificationsActive />
            </div>
          </Chip>
        )}

        <Card
          style={
            viewOnly
              ? {
                  pointerEvents: 'none',
                }
              : {}
          }
          variant='plain'
          sx={{
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
              xs={4}
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
                  <div
                    style={{
                      position: 'relative',
                      alignItems: 'center',
                    }}
                  >
                    <Check />
                  </div>
                </IconButton>
                <IconButton
                  variant='soft'
                  color='success'
                  ref={this.moreMenuRef}
                  onClick={this.handleMoreMenu}
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
                  anchorEl={this.moreMenuRef.current}
                  open={isMoreMenuOpen}
                  ref={this.menuRef}
                >
                  {task.frequency.type !== 'once' && (
                    <MenuItem onClick={this.onSkipTask}>
                      <SwitchAccessShortcut />
                      Skip to next due date
                    </MenuItem>
                  )}
                  <MenuItem onClick={this.onChangeDueDate}>
                    <MoreTime />
                    Change due date
                  </MenuItem>
                  <MenuItem onClick={() => this.handleEdit(task.id)}>
                    <Edit />
                    Edit
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={() => this.handleHistory(task.id)}>
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
              xs={8}
              style={{
                cursor: 'pointer',
              }}
              onClick={() => navigate(NavigationPaths.TaskEdit(task.id))}
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
                  <Typography level='title-md'>{task.title}</Typography>
                  <Box key={`${task.id}-labels`}>
                    {task.labels?.map((l, index) => {
                      return (
                        <Chip
                          variant='solid'
                          key={`taskcard-${task.id}-label-${l.id}`}
                          sx={{
                            position: 'relative',
                            ml: index === 0 ? 0 : 0.5,
                            top: 2,
                            zIndex: 1,
                            backgroundColor: `${l?.color}`,
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
            ref={this.dateModalRef}
            title={`Change due date`}
            onClose={this.handleChangeDueDate}
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
