import { CreateTask, SaveTask, DeleteTask, GetTaskByID } from '@/api/tasks'
import { Label } from '@/models/label'
import { FrequencyMetadata, Task } from '@/models/task'
import { getTextColorFromBackgroundColor } from '@/utils/Colors'
import { FrequencyType, NotificationTrigger } from '@/utils/recurrance'
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
  Card,
  Select,
  Chip,
  MenuItem,
  Sheet,
  Divider,
  Button,
  Snackbar,
  Option,
} from '@mui/joy'
import moment from 'moment'
import React, { ChangeEvent } from 'react'
import { ConfirmationModal } from '@/views/Modals/Inputs/ConfirmationModal'
import { LabelModal } from '@/views/Modals/Inputs//LabelModal'
import { RepeatOption } from './RepeatOption'
import { goToMyTasks } from '@/utils/navigation'
import { SelectValue } from '@mui/base/useSelect/useSelect.types'

const REPEAT_ON_TYPE = ['interval', 'days_of_the_week', 'day_of_the_month']
const NO_DUE_DATE_REQUIRED_TYPE = ['no_repeat', 'once']
const NO_DUE_DATE_ALLOWED_TYPE = ['trigger']

interface TaskEditProps {
  taskId: string | null
}

interface NotificationMetadata {
  dueDate: boolean
  predue: boolean
  overdue: boolean
  nagging: boolean
}

type Errors = { [key: string]: string }

// TODO: Some of these should be props
interface TaskEditState {
  isRolling: boolean
  isNotificable: boolean
  updatedBy: number
  errors: Errors
  isSnackbarOpen: boolean
  snackbarMessage: React.ReactNode
  snackbarColor: ColorPaletteProp
  dueDate: string | null
  frequencyType: FrequencyType
  frequency: number
  frequencyMetadata: FrequencyMetadata | null
  labels: Label[]
  notificationMetadata: NotificationMetadata
  userLabels: Label[]
  task: Task | null
  title: string
}

type NotificationTriggerOption = {
  type: NotificationTrigger
  title: string
  description: string
}

export class TaskEdit extends React.Component<TaskEditProps, TaskEditState> {
  private labelModalRef = React.createRef<LabelModal>()
  private confirmModelRef = React.createRef<ConfirmationModal>()

  constructor(props: TaskEditProps) {
    super(props)
    this.state = {
      isRolling: false,
      isNotificable: false,
      updatedBy: 0,
      errors: {},
      isSnackbarOpen: false,
      snackbarMessage: null,
      snackbarColor: 'warning',
      dueDate: null,
      frequencyType: 'once',
      frequency: 1,
      frequencyMetadata: null,
      labels: [],
      notificationMetadata: {
        dueDate: false,
        predue: false,
        overdue: false,
        nagging: false,
      },
      userLabels: [],
      task: null,
      title: '',
    }
  }

  private HandleValidateTask = () => {
    const { title, frequencyType, frequency, frequencyMetadata, dueDate } =
      this.state

    // TODO: This should no longer be required once the redundancy is removed
    if (!frequencyMetadata) {
      return false
    }

    const errors: Errors = {}

    if (title.trim() === '') {
      errors.title = 'Title is required'
    }
    if (frequencyType === 'interval' && frequency <= 0) {
      errors.frequency = `Invalid frequency, the ${frequencyMetadata.unit} should be > 0`
    }
    if (
      frequencyType === 'days_of_the_week' &&
      frequencyMetadata['days']?.length === 0
    ) {
      errors.frequency = 'At least 1 day is required'
    }
    if (
      frequencyType === 'day_of_the_month' &&
      frequencyMetadata['months']?.length === 0
    ) {
      errors.frequency = 'At least 1 month is required'
    }
    if (
      dueDate === null &&
      !NO_DUE_DATE_REQUIRED_TYPE.includes(frequencyType) &&
      !NO_DUE_DATE_ALLOWED_TYPE.includes(frequencyType)
    ) {
      if (REPEAT_ON_TYPE.includes(frequencyType)) {
        errors.dueDate = 'Start date is required'
      } else {
        errors.dueDate = 'Due date is required'
      }
    }

    // if there is any error then return false:
    const newState: TaskEditState = {
      ...this.state,
      errors,
    }

    let isSuccessful = true
    if (Object.keys(errors).length > 0) {
      // generate a list with error and set it in snackbar:
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
    this.setState({ dueDate: e.target.value })
  }

  private HandleSaveTask = async () => {
    if (!this.HandleValidateTask()) {
      return
    }

    const { taskId } = this.props
    const {
      title,
      frequencyType,
      frequency,
      frequencyMetadata,
      dueDate,
      isRolling,
      isNotificable,
      labels,
      notificationMetadata,
    } = this.state

    // TODO: type hardening
    const task: any = {
      id: taskId,
      title,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      isRolling,
      frequency,
      frequencyType: frequencyType,
      frequencyMetadata: JSON.stringify(frequencyMetadata ),
      notification: isNotificable,
      labels: labels,
      notificationMetadata: notificationMetadata,
    }

    let SaveFunction = CreateTask
    if (taskId !== null) {
      SaveFunction = SaveTask
    }

    try {
      await SaveFunction(task)
      goToMyTasks()
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
      goToMyTasks()
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

  private NotificationTriggerOptions: NotificationTriggerOption[] = [
    {
      title: 'Due Date/Time',
      description: 'A simple reminder that a task is due',
      type: 'dueDate',
    },
    {
      title: 'Predued',
      description: 'before a task is due in few hours',
      type: 'predue',
    },
    {
      title: 'Overdue',
      description: 'A notification when a task is overdue',
      type: 'overdue',
    },
    {
      title: 'Nagging',
      description: 'Daily reminders until the task is completed',
      type: 'nagging',
    },
  ]

  private loadTask = async (taskId: string) => {
    try {
      const data = await GetTaskByID(taskId)
      // TODO: There is so much redundancy here
      const task: any = data.task

      this.setState({
        task: task,
        title: task.title,
        frequencyType: task.frequencyType ? task.frequencyType : 'once',
        // frequencyMetadata: JSON.parse(task.frequencyMetadata),
        frequency: task.frequency,
        // notificationMetadata: JSON.parse(task.notificationMetadata),
        isRolling: task.isRolling,
        dueDate: task.nextDueDate
          ? moment(task.nextDueDate).format('YYYY-MM-DDTHH:mm:ss')
          : null,
        isNotificable: task.notification,
      })
    } catch {
      this.setState({
        isSnackbarOpen: true,
        snackbarMessage: 'You are not authorized to view this task.',
        snackbarColor: 'danger',
      })

      setTimeout(() => {
        goToMyTasks()
      }, 3000)
    }
  }

  componentDidMount(): void {
    // TODO: Load and set labels and userLabels

    // Load task data
    const { taskId } = this.props
    if (taskId != null) {
      this.loadTask(taskId)
    } else {
      // TODO: focus input box
    }
  }

  componentDidUpdate(
    prevProps: Readonly<TaskEditProps>,
    prevState: Readonly<TaskEditState>,
  ): void {
    const { frequencyType, dueDate } = this.state

    if (frequencyType !== prevState.frequencyType) {
      // if frequancy type change to somthing need a due date then set it to the current date:
      if (!NO_DUE_DATE_REQUIRED_TYPE.includes(frequencyType) && !dueDate) {
        this.setState({
          dueDate: moment(new Date()).format('YYYY-MM-DDTHH:mm:00'),
        })
      } else if (NO_DUE_DATE_ALLOWED_TYPE.includes(frequencyType)) {
        this.setState({
          dueDate: null,
        })
      }
    }
  }

  private onTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ title: e.target.value })
  }

  private onDueDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      this.setState({
        dueDate: moment(new Date()).format('YYYY-MM-DDTHH:mm:00'),
      })
    } else {
      this.setState({ dueDate: null })
    }
  }

  private onNotificationsChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ isNotificable: e.target.checked })
  }

  private onRescheduleFromDueDate = () => {
    this.setState({ isRolling: false })
  }

  private onRescheduleFromCompletionDate = () => {
    this.setState({ isRolling: true })
  }

  private onNotificationOptionChange = (item: NotificationTriggerOption) => {
    const { notificationMetadata } = this.state
    this.setState({
      notificationMetadata: {
        ...notificationMetadata,
        [item.type]: !notificationMetadata[item.type],
      },
    })
  }

  private onLabelsChange = (event: React.MouseEvent | React.KeyboardEvent | React.FocusEvent | null, value: SelectValue<string[], false>) => {
    if (!value) {
      return
    }

    const { userLabels } = this.state
    this.setState({
      labels: userLabels.filter(l => value.indexOf(l.name) > -1),
    })
  }

  private onAddNewLabel = () => {
    this.labelModalRef.current?.open()
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
    goToMyTasks()
  }

  render(): React.ReactNode {
    const { taskId } = this.props
    const {
      title,
      frequency,
      frequencyType,
      frequencyMetadata,
      dueDate,
      isRolling,
      isNotificable,
      labels,
      notificationMetadata,
      userLabels,
      errors,
      isSnackbarOpen,
      snackbarMessage,
      snackbarColor,
    } = this.state
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
        {frequencyMetadata && (
          <RepeatOption
            frequency={frequency}
            onFrequencyUpdate={newFrequency =>
              this.setState({ frequency: newFrequency })
            }
            frequencyType={frequencyType}
            onFrequencyTypeUpdate={newFrequencyType =>
              this.setState({ frequencyType: newFrequencyType })
            }
            frequencyMetadata={frequencyMetadata}
            onFrequencyMetadataUpdate={newFrequencyMetadata =>
              this.setState({ frequencyMetadata: newFrequencyMetadata })
            }
            onFrequencyTimeUpdate={t => {
              this.setState({
                frequencyMetadata: { ...frequencyMetadata, time: t },
              })
            }}
            frequencyError={errors?.frequency}
          />
        )}

        <Box mt={2}>
          <Typography level='h4'>
            {REPEAT_ON_TYPE.includes(frequencyType) ? 'Start date' : 'Due date'}{' '}
            :
          </Typography>

          {NO_DUE_DATE_REQUIRED_TYPE.includes(frequencyType) && (
            <FormControl sx={{ mt: 1 }}>
              <Checkbox
                onChange={this.onDueDateChange}
                defaultChecked={dueDate !== null}
                overlay
                label='Give this task a due date'
              />
              <FormHelperText>
                task needs to be completed by a specific time.
              </FormHelperText>
            </FormControl>
          )}
          {dueDate && (
            <FormControl error={Boolean(errors.dueDate)}>
              <Typography>
                {REPEAT_ON_TYPE.includes(frequencyType)
                  ? 'When does this task start?'
                  : 'When is the next first time this task is due?'}
              </Typography>
              <Input
                type='datetime-local'
                value={dueDate}
                onChange={this.handleDueDateChange}
              />
              <FormHelperText>{errors.dueDate}</FormHelperText>
            </FormControl>
          )}
        </Box>
        {!['once', 'no_repeat'].includes(frequencyType) && (
          <Box mt={2}>
            <Typography level='h4'>Scheduling Preferences: </Typography>
            <Typography>How to reschedule the next due date?</Typography>

            <RadioGroup
              name='tiers'
              sx={{ gap: 1, '& > div': { p: 1 } }}
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
        <Box mt={2}>
          <Typography level='h4'>Notifications : </Typography>
          <Typography>
            Get Reminders when this task is due or completed
          </Typography>

          <FormControl sx={{ mt: 1 }}>
            <Checkbox
              onChange={this.onNotificationsChange}
              defaultChecked={isNotificable}
              overlay
              label='Notify for this task'
            />
            <FormHelperText>
              When should receive notifications for this task
            </FormHelperText>
          </FormControl>
        </Box>
        {isNotificable && (
          <Box
            ml={4}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,

              '& > div': { p: 2, borderRadius: 'md', display: 'flex' },
            }}
          >
            <Card variant='outlined'>
              <Typography>What should trigger the notification?</Typography>
              {this.NotificationTriggerOptions.map(item => (
                <FormControl
                  sx={{ mb: 1 }}
                  key={item.type}
                >
                  <Checkbox
                    overlay
                    onClick={() => this.onNotificationOptionChange(item)}
                    checked={
                      notificationMetadata
                        ? notificationMetadata[item.type]
                        : false
                    }
                    label={item.title}
                    key={item.title}
                  />
                  <FormHelperText>{item.description}</FormHelperText>
                </FormControl>
              ))}
            </Card>
          </Box>
        )}
        <Box mt={2}>
          <Typography level='h4'>Labels :</Typography>
          <Typography>
            Things to remember about this task or to tag it
          </Typography>
          <Select
            multiple
            onChange={this.onLabelsChange}
            value={labels.map(l => l.name)}
            renderValue={() => (
              <Box sx={{ display: 'flex', gap: '0.25rem' }}>
                {labels.map(selectedOption => {
                  return (
                    <Chip
                      variant='soft'
                      color='primary'
                      key={selectedOption.id}
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
            {userLabels &&
              userLabels.map(label => (
                <Option
                  key={label.id + label.name}
                  value={label.name}
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

        <Divider sx={{ mb: 9 }} />

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
        <LabelModal
          id={undefined}
          name={undefined}
          color={undefined}
          ref={this.labelModalRef}
          onClose={() => console.error('missing impl')}
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
