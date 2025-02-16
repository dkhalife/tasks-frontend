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
  Button,
  Snackbar,
} from '@mui/joy'
import React, { ChangeEvent } from 'react'
import { ConfirmationModal } from '@/views/Modals/Inputs/ConfirmationModal'
import { LabelModal } from '@/views/Modals/Inputs//LabelModal'
import { RepeatOption } from './RepeatOption'
import { goToMyTasks } from '@/utils/navigation'
import { SelectValue } from '@mui/base/useSelect/useSelect.types'
import moment from 'moment'

const REPEAT_ON_TYPE = ['interval', 'days_of_the_week', 'day_of_the_month']
const NO_DUE_DATE_REQUIRED_TYPE = ['no_repeat', 'once']

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
  title: string
  nextDueDate: Date | null
  labels: Label[]
  frequencyType: FrequencyType
  frequency: number
  isRolling: boolean
  frequencyMetadata: FrequencyMetadata
  isNotificable: boolean
  notificationMetadata: NotificationMetadata
  errors: Errors
  isSnackbarOpen: boolean
  snackbarMessage: React.ReactNode
  snackbarColor: ColorPaletteProp
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
      title: '',
      nextDueDate: null,
      labels: [],
      frequencyType: 'once',
      frequency: 1,
      isRolling: false,
      frequencyMetadata: {
        unit: 'days',
        time: moment(new Date()).format('HH:mm'),
      },
      isNotificable: false,
      notificationMetadata: {
        dueDate: false,
        predue: false,
        overdue: false,
        nagging: false,
      },
      isSnackbarOpen: false,
      snackbarMessage: null,
      snackbarColor: 'warning',
      errors: {},
    }
  }

  private HandleValidateTask = () => {
    const { title, frequencyType, frequency, frequencyMetadata, nextDueDate } =
      this.state

    const errors: Errors = {}

    if (title.trim() === '') {
      errors.title = 'Title is required'
    }

    if (frequencyMetadata) {
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
        nextDueDate === null &&
        !NO_DUE_DATE_REQUIRED_TYPE.includes(frequencyType)
      ) {
        if (REPEAT_ON_TYPE.includes(frequencyType)) {
          errors.dueDate = 'Start date is required'
        } else {
          errors.dueDate = 'Due date is required'
        }
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

    const { taskId } = this.props
    const {
      title,
      frequencyType,
      frequency,
      frequencyMetadata,
      nextDueDate,
      labels,
    } = this.state

    const task: Omit<Task, 'id'> = {
      title,
      labels: labels,
      next_due_date: nextDueDate,
      frequency,
      frequency_type: frequencyType,
      frequency_metadata: JSON.stringify(frequencyMetadata)
    }

    try {
      const promise = (taskId === null) ? CreateTask(task) : SaveTask({
        ...task,
        id: taskId
      })

      await promise
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
      description: 'After the due date and time has passed',
      type: 'dueDate',
    },
    {
      title: 'Predued',
      description: 'A few hours before the due date',
      type: 'predue',
    },
    {
      title: 'Overdue',
      description: 'When left uncompleted at least one day past its due date',
      type: 'overdue',
    },
    {
      title: 'Nagging',
      description: 'Daily until completed',
      type: 'nagging',
    },
  ]

  private loadTask = async (taskId: string) => {
    try {
      const task = (await GetTaskByID(taskId)).task

      this.setState({
        title: task.title,
        nextDueDate: task.next_due_date,
        frequencyType: task.frequency_type as FrequencyType ?? 'once',
        frequency: task.frequency,
        //frequencyMetadata: JSON.parse(task.frequencyMetadata),
        //isRolling: task.isRolling,
        //isNotificable: false // TODO: Notifications,
        // notificationMetadata: JSON.parse(task.notificationMetadata),
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
    const { frequencyType, nextDueDate } = this.state

    if (frequencyType !== prevState.frequencyType) {
      // if frequency type change to somthing need a due date then set it to the current date:
      if (!nextDueDate && !NO_DUE_DATE_REQUIRED_TYPE.includes(frequencyType)) {
        /*this.setState({
          // TODO: Set due date
        })*/
      }
    }
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

    // TODO: Consolidate labels
    /*const { userLabels } = this.state
    this.setState({
      labels: userLabels.filter(l => value.indexOf(l.name) > -1),
    })*/
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
      nextDueDate,
      isRolling,
      isNotificable,
      labels,
      notificationMetadata,
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
            { /* TODO: Consolidate labels
            userLabels &&
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
              ))*/}
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
            {REPEAT_ON_TYPE.includes(frequencyType) ? 'Next due date' : 'Due date'}{' '}
            :
          </Typography>

          {NO_DUE_DATE_REQUIRED_TYPE.includes(frequencyType) && (
            <FormControl sx={{ mt: 1 }}>
              <Checkbox
                onChange={this.onDueDateChange}
                checked={nextDueDate !== null}
                overlay
                label='Give this task a due date'
              />
            </FormControl>
          )}
          {nextDueDate && (
            <FormControl error={Boolean(errors.dueDate)}>
              <Typography>
                {REPEAT_ON_TYPE.includes(frequencyType)
                  ? 'When does this task start?'
                  : 'When is the next first time this task is due?'}
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
            frequency={frequency}
            onFrequencyUpdate={newFrequency =>
              this.setState({
                frequency: newFrequency,
              })
            }
            frequencyType={frequencyType}
            onFrequencyTypeUpdate={newFrequencyType =>
              this.setState({
                frequencyType: newFrequencyType,
              })
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

        {!['once', 'no_repeat'].includes(frequencyType) && (
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

        <Box mt={2}>
          <Typography level='h4'>Notifications :</Typography>

          <FormControl sx={{ mt: 1 }}>
            <Checkbox
              onChange={this.onNotificationsChange}
              checked={isNotificable}
              overlay
              label='Notify for this task'
            />
          </FormControl>
        </Box>
        {isNotificable && (
          <Box
            mt={1}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,

              '& > div': { p: 2, borderRadius: 'md', display: 'flex' },
            }}
          >
            <Card variant='outlined'>
              <Typography>When should notifications trigger?</Typography>
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
