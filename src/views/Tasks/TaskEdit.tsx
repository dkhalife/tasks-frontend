import { CreateTask, SaveTask, DeleteTask, GetTaskByID } from '@/api/tasks'
import { Label } from '@/models/label'
import { Frequency, Task } from '@/models/task'
import { getTextColorFromBackgroundColor } from '@/utils/Colors'
import { Add } from '@mui/icons-material'
import {
  ColorPaletteProp,
  ListItem,
  Stack,
  Typography,
  List,
  Container,
  Box,
  FormControl,
  Input,
  FormHelperText,
  Checkbox,
  RadioGroup,
  Radio,
  Select,
  Chip,
  MenuItem,
  Sheet,
  Button,
  Snackbar,
  Option,
} from '@mui/joy'
import React, { ChangeEvent } from 'react'
import { ConfirmationModal } from '@/views/Modals/Inputs/ConfirmationModal'
import { RepeatOption } from './RepeatOption'
import { SelectValue } from '@mui/base/useSelect/useSelect.types'
import moment from 'moment'
import { setTitle } from '@/utils/dom'
import { NavigationPaths, WithNavigate } from '@/utils/navigation'
import { Notification, NotificationTriggerOptions } from '@/models/notifications'
import { NotificationOptions } from '@/views/Notifications/NotificationOptions'
import { GetLabels } from '@/api/labels'
import { GetUserProfile } from '@/api/users'

export type TaskEditProps = WithNavigate & {
  taskId: string | null
}

type Errors = { [key: string]: string }

export interface TaskEditState {
  title: string
  nextDueDate: Date | null
  taskLabels: Label[]
  userLabels: Label[]
  frequency: Frequency
  isRolling: boolean
  notification: Notification
  errors: Errors
  isSnackbarOpen: boolean
  snackbarMessage: React.ReactNode
  snackbarColor: ColorPaletteProp
}

export class TaskEdit extends React.Component<TaskEditProps, TaskEditState> {
  private confirmModelRef = React.createRef<ConfirmationModal>()
  private defaultNotificationTriggers: NotificationTriggerOptions = {
    due_date: true,
    pre_due: false,
    overdue: false,
  }

  constructor(props: TaskEditProps) {
    super(props)
    this.state = {
      title: '',
      nextDueDate: null,
      taskLabels: [],
      userLabels: [],
      frequency: {
        type: 'once',
      },
      isRolling: false,
      notification: {
        enabled: false,
      },
      isSnackbarOpen: false,
      snackbarMessage: null,
      snackbarColor: 'warning',
      errors: {},
    }
  }

  private HandleValidateTask = () => {
    const { title, frequency, nextDueDate } = this.state
    const errors: Errors = {}

    if (title.trim() === '') {
      errors.title = 'Title is required'
    }

    const frequencyType = frequency.type

    if (frequencyType !== 'once' && nextDueDate === null) {
      errors.dueDate = 'Start date is required'
    }

    if (frequencyType === 'custom') {
      if (frequency.on === 'interval' && frequency.every <= 0) {
        errors.frequency = 'Invalid frequency, the value should be greater than 0'
      }

      if (frequency.on === 'days_of_the_week' && frequency.days.length === 0) {
        errors.frequency = 'At least 1 day is required'
      }

      if (frequency.on === 'day_of_the_months' && frequency.months.length === 0) {
        errors.frequency = 'At least 1 month is required'
      }
    }

    const newState: TaskEditState = {
      ...this.state,
      errors,
    }

    let isSuccessful = true
    if (Object.keys(errors).length > 0) {
      const errorList = Object.keys(errors).map(key => (
        <ListItem key={key}>{errors[key]}</ListItem>
      ))

      newState.snackbarMessage = (
        <Stack spacing={0.5}>
          <Typography level='title-md'>
            Please resolve the following errors:
          </Typography>
          <List>{errorList}</List>
        </Stack>
      )

      newState.snackbarColor = 'danger'
      newState.isSnackbarOpen = true

      isSuccessful = false
    }

    this.setState(newState)
    return isSuccessful
  }

  private handleDueDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      nextDueDate: moment(e.target.value).toDate(),
    })
  }

  private HandleSaveTask = async () => {
    if (!this.HandleValidateTask()) {
      return
    }

    const { taskId, navigate } = this.props
    const {
      title,
      frequency,
      nextDueDate,
      isRolling,
      taskLabels,
      notification,
    } = this.state

    const task: Omit<Task, 'id'> = {
      title,
      labels: taskLabels,
      next_due_date: nextDueDate,
      is_rolling: isRolling,
      frequency,
      notification,
    }

    try {
      const promise = (taskId === null) ? CreateTask(task) : SaveTask({
        ...task,
        id: taskId
      })

      await promise
      navigate(NavigationPaths.MyTasks)
    } catch {
      this.setState({
        isSnackbarOpen: true,
        snackbarMessage: 'Failed to save task',
        snackbarColor: 'danger',
      })
    }
  }

  private onTaskDelete = async (taskId: string) => {
    try {
      await DeleteTask(taskId)
      this.props.navigate(NavigationPaths.MyTasks)
    } catch {
      this.setState({
        isSnackbarOpen: true,
        snackbarMessage: 'Failed to delete task',
        snackbarColor: 'danger',
      })
    }
  }

  private handleDelete = () => {
    this.confirmModelRef.current?.open()
  }

  private loadTask = async (taskId: string) => {
    try {
      const task = (await GetTaskByID(taskId)).task
      const { userLabels } = this.state

      this.setState({
        title: task.title,
        nextDueDate: task.next_due_date,
        frequency: task.frequency,
        isRolling: task.is_rolling,
        notification: task.notification,
        taskLabels: task.labels.map(taskLabel => userLabels.find(userLabel => userLabel.id === taskLabel.id)).filter(Boolean) as Label[],
      })

      setTitle(task.title)
    } catch {
      this.setState({
        isSnackbarOpen: true,
        snackbarMessage: 'You are not authorized to view this task.',
        snackbarColor: 'danger',
      })

      setTimeout(() => {
        this.props.navigate(NavigationPaths.MyTasks)
      }, 3000)
    }
  }

  private init = async () => {
    const { taskId } = this.props
    
    const data = await GetLabels()
    this.setState({
      userLabels: data.labels,
    })

    const userProfile = (await GetUserProfile()).user
    const defaultNotifications = userProfile.notifications
    if (defaultNotifications.provider.provider !== 'none') {
      this.defaultNotificationTriggers = defaultNotifications.triggers
    }

    if (taskId != null) {
      await this.loadTask(taskId)
    }
  }

  componentDidMount(): void {
    this.init()
  }

  private onTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ title: e.target.value })
  }

  private onDueDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      nextDueDate: e.target.checked ? new Date() : null,
    })
  }

  private onNotificationsChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      notification: e.target.checked ? {
        enabled: true,
        due_date: this.defaultNotificationTriggers.due_date,
        pre_due: this.defaultNotificationTriggers.pre_due,
        overdue: this.defaultNotificationTriggers.overdue,
      } : {
        enabled: false,
      },
    })
  }

  private onNotificationOptionsChange = (notification: NotificationTriggerOptions) => {
    if (!this.state.notification.enabled) {
      throw new Error('Notifications are disabled')
    }

    this.setState({
      notification: {
        ...this.state.notification,
        ...notification,
      },
    })
  }

  private onRescheduleFromDueDate = () => {
    this.setState({
      isRolling: false,
    })
  }

  private onRescheduleFromCompletionDate = () => {
    this.setState({
      isRolling: true,
    })
  }

  private onLabelsChange = (event: React.MouseEvent | React.KeyboardEvent | React.FocusEvent | null, value: SelectValue<Label[], false>) => {
    if (!value) {
      return
    }

    const { userLabels } = this.state
    this.setState({
      taskLabels: userLabels.filter(userLabel => value.findIndex((selected) => selected.id === userLabel.id) !== -1),
    })
  }

  private onAddNewLabel = () => {
    this.props.navigate(NavigationPaths.Labels)
  }

  private onDeleteConfirmed = (isConfirmed: boolean) => {
    if (this.props.taskId === null) {
      console.error('Task ID is null')
      return
    }

    if (isConfirmed === true) {
      this.onTaskDelete(this.props.taskId)
    }
  }

  private onSnackbarClose = () => {
    this.setState({
      isSnackbarOpen: false,
      snackbarMessage: null,
    })
  }

  private onCancelClicked = () => {
    this.props.navigate(NavigationPaths.MyTasks)
  }

  render(): React.ReactNode {
    const { taskId } = this.props
    const {
      title,
      frequency,
      nextDueDate,
      isRolling,
      notification,
      taskLabels,
      userLabels,
      errors,
      isSnackbarOpen,
      snackbarMessage,
      snackbarColor,
    } = this.state
    const frequencyType = frequency.type
    const isRecurring = frequencyType !== 'once'
    const notificationsEnabled = notification.enabled

    return (
      <Container maxWidth='md'>
        <Box>
          <FormControl error={Boolean(errors.title)}>
            <Typography level='h4'>Description :</Typography>
            <Typography>What is this task about?</Typography>
            <Input
              value={title}
              onChange={this.onTitleChange}
            />
            <FormHelperText>{errors.title}</FormHelperText>
          </FormControl>
        </Box>
        <Box mt={2}>
          <Typography level='h4'>Labels :</Typography>
          <Typography>
            Things to remember about this task or to tag it
          </Typography>
          <Select
            multiple
            onChange={this.onLabelsChange}
            value={taskLabels}
            renderValue={() => (
              <Box sx={{
                  display: 'flex',
                  gap: '0.25rem',
                }}>
                {taskLabels.map(selectedOption => {
                  return (
                    <Chip
                      variant='soft'
                      color='primary'
                      key={`label-${selectedOption.id}`}
                      size='lg'
                      sx={{
                        background: selectedOption.color,
                        color: getTextColorFromBackgroundColor(
                          selectedOption.color,
                        ),
                      }}
                    >
                      {selectedOption.name}
                    </Chip>
                  )
                })}
              </Box>
            )}
            sx={{ minWidth: '15rem' }}
            slotProps={{
              listbox: {
                sx: {
                  width: '100%',
                },
              },
            }}
          >
            { userLabels &&
              userLabels.map(label => (
                <Option
                  key={`label-${label.id}`}
                  value={label}
                >
                  <div
                    style={{
                      width: '20 px',
                      height: '20 px',
                      borderRadius: '50%',
                      background: label.color,
                    }}
                  />
                  {label.name}
                </Option>
              ))}
            <MenuItem
              key={'addNewLabel'}
              onClick={this.onAddNewLabel}
            >
              <Add />
              Add New Label
            </MenuItem>
          </Select>
        </Box>

        <Box mt={2}>
          <Typography level='h4'>
            {isRecurring ? 'Next due date :' : 'Due date :'}
          </Typography>

          <FormControl sx={{ mt: 1 }}>
            <Checkbox
              onChange={this.onDueDateChange}
              checked={nextDueDate !== null}
              overlay
              label='Give this task a due date'
            />
          </FormControl>

          {nextDueDate && (
            <FormControl error={Boolean(errors.dueDate)}>
              <Typography>
                {isRecurring
                  ? 'When is the next first time this task is due?'
                  : 'When is this task due?'}
              </Typography>
              <Input
                type='datetime-local'
                value={moment(nextDueDate).format('yyyy-MM-DD[T]HH:mm')}
                onChange={this.handleDueDateChange}
              />
              <FormHelperText>{errors.dueDate}</FormHelperText>
            </FormControl>
          )}
        </Box>

        {nextDueDate && (
          <RepeatOption
            nextDueDate={nextDueDate}
            frequency={frequency}
            onFrequencyUpdate={newFrequency =>
              this.setState({
                frequency: newFrequency,
              })
            }
            frequencyError={errors?.frequency}
          />
        )}

        {isRecurring && (
          <Box mt={2}>
            <Typography level='h4'>Scheduling Preferences :</Typography>
            <Typography>How should the next occurrence be calculated?</Typography>

            <RadioGroup
              name='tiers'
              sx={{
                gap: 1,
                '& > div': {
                  p: 1,
                }
              }}
            >
              <FormControl>
                <Radio
                  overlay
                  checked={!isRolling}
                  onClick={this.onRescheduleFromDueDate}
                  label='Reschedule from due date'
                />
                <FormHelperText>
                  the next task will be scheduled from the original due date,
                  even if the previous task was completed late
                </FormHelperText>
              </FormControl>
              <FormControl>
                <Radio
                  overlay
                  checked={isRolling}
                  onClick={this.onRescheduleFromCompletionDate}
                  label='Reschedule from completion date'
                />
                <FormHelperText>
                  the next task will be scheduled from the actual completion
                  date of the previous task
                </FormHelperText>
              </FormControl>
            </RadioGroup>
          </Box>
        )}

        {nextDueDate && (
          <Box mt={2}>
            <Typography level='h4'>Notifications :</Typography>

            <FormControl sx={{ mt: 1 }}>
              <Checkbox
                onChange={this.onNotificationsChange}
                checked={notificationsEnabled}
                overlay
                label='Notify for this task'
              />
            </FormControl>
          </Box>
        )}

        {notificationsEnabled && (
          <NotificationOptions notification={notification} onChange={this.onNotificationOptionsChange} />
        )}

        <Sheet
          variant='outlined'
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 2,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
            'z-index': 1000,
            bgcolor: 'background.body',
            boxShadow: 'md',
          }}
        >
          {taskId != null && (
            <Button
              color='danger'
              variant='solid'
              onClick={this.handleDelete}
            >
              Delete
            </Button>
          )}
          <Button
            color='neutral'
            variant='outlined'
            onClick={this.onCancelClicked}
          >
            Cancel
          </Button>
          <Button
            color='primary'
            variant='solid'
            onClick={this.HandleSaveTask}
          >
            {taskId != null ? 'Save' : 'Create'}
          </Button>
        </Sheet>
        <ConfirmationModal
          ref={this.confirmModelRef}
          title='Delete Task'
          confirmText='Delete'
          cancelText='Cancel'
          message='Are you sure you want to delete this task?'
          onClose={this.onDeleteConfirmed}
        />
        <Snackbar
          open={isSnackbarOpen}
          onClose={this.onSnackbarClose}
          color={snackbarColor}
          autoHideDuration={4000}
          sx={{ bottom: 70 }}
          invertedColors={true}
          variant='soft'
        >
          {snackbarMessage}
        </Snackbar>
      </Container>
    )
  }
}
