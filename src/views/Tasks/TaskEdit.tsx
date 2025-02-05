import { Add } from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  ColorPaletteProp,
  Container,
  Divider,
  FormControl,
  FormHelperText,
  Input,
  List,
  ListItem,
  MenuItem,
  Option,
  Radio,
  RadioGroup,
  Select,
  Sheet,
  Snackbar,
  Stack,
  Typography,
} from '@mui/joy'
import moment from 'moment'
import { getTextColorFromBackgroundColor } from '../../utils/Colors'
import {
  ConfirmationModal,
  ConfirmationModalProps,
} from '../Modals/Inputs/ConfirmationModal'
import { LabelModal } from '../Modals/Inputs/LabelModal'
import React, { ChangeEvent } from 'react'
import { RepeatOption } from './RepeatOption'
import { withNavigation } from '../../contexts/hooks'
import { Task, FrequencyMetadata } from '../../models/task'
import { Label } from '../../models/label'
import { CreateTask, SaveTask, DeleteTask, GetTaskByID } from '../../api/tasks'
import { FrequencyType, NotificationTrigger } from '@/utils/recurrance'

const REPEAT_ON_TYPE = ['interval', 'days_of_the_week', 'day_of_the_month']
const NO_DUE_DATE_REQUIRED_TYPE = ['no_repeat', 'once']
const NO_DUE_DATE_ALLOWED_TYPE = ['trigger']

interface TaskEditProps {
  taskId: string | null
}

type TaskEditInnerProps = TaskEditProps & {
  navigate: (path: string) => void
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
  name: string
  confirmModelConfig: ConfirmationModalProps
}

type NotificationTriggerOption = {
  type: NotificationTrigger
  title: string
  description: string
}

class TaskEditInner extends React.Component<
  TaskEditInnerProps,
  TaskEditState
> {
  private labelModalRef = React.createRef<LabelModal>()

  constructor(props: TaskEditInnerProps) {
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
      name: '',
      confirmModelConfig: {
        cancelText: '',
        confirmText: '',
        message: '',
        onClose: () => {},
        title: '',
      },
    }
  }

  private HandleValidateTask = () => {
    const { name, frequencyType, frequency, frequencyMetadata, dueDate } =
      this.state

    // TODO: This should no longer be required once the redundancy is removed
    if (!frequencyMetadata) {
      return false
    }

    const errors: Errors = {}

    if (name.trim() === '') {
      errors.name = 'Name is required'
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

  private HandleSaveTask = () => {
    if (!this.HandleValidateTask()) {
      return
    }

    const { taskId } = this.props
    const {
      name,
      frequencyType,
      frequency,
      frequencyMetadata,
      dueDate,
      isRolling,
      isNotificable,
      labels,
      notificationMetadata,
    } = this.state
    const task: any = {
      id: taskId,
      name: name,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      frequencyType: frequencyType,
      frequency: Number(frequency),
      frequencyMetadata: frequencyMetadata,
      isRolling: isRolling,
      notification: isNotificable,
      labels: labels,
      notificationMetadata: notificationMetadata,
    }

    let SaveFunction = CreateTask
    if (taskId !== null) {
      SaveFunction = SaveTask
    }

    SaveFunction(task).then(response => {
      if (response.status === 200) {
        this.props.navigate(`/my/tasks`)
      } else {
        this.setState({
          isSnackbarOpen: true,
          snackbarMessage: 'Failed to save task',
          snackbarColor: 'danger',
        })
      }
    })
  }

  private handleDelete = (taskId: string) => {
    this.setState({
      confirmModelConfig: {
        title: 'Delete Task',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        message: 'Are you sure you want to delete this task?',
        onClose: isConfirmed => {
          if (isConfirmed === true) {
            DeleteTask(taskId).then(() => {
              this.props.navigate('/my/tasks')
            }).catch(() => {
              this.setState({
                isSnackbarOpen: true,
                snackbarMessage: 'Failed to delete task',
                snackbarColor: 'danger',
              })
            })
          }

          this.setState({
            confirmModelConfig: {
              title: '',
              confirmText: '',
              cancelText: '',
              message: '',
              onClose: () => {},
            },
          })
        },
      },
    })
    this.labelModalRef.current?.open()
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

  componentDidMount(): void {
    // TODO: Load and set labels and userLabels

    // Load task data
    const { taskId } = this.props
    if (taskId != null) {
      GetTaskByID(taskId)
        .then(data => {
          // TODO: There is so much redundancy here
          this.setState({
            task: data.res,
            name: data.res.name ? data.res.name : '',
            frequencyType: data.res.frequencyType
              ? data.res.frequencyType
              : 'once',
            frequencyMetadata: JSON.parse(data.res.frequencyMetadata),
            frequency: data.res.frequency,
            notificationMetadata: JSON.parse(data.res.notificationMetadata),
            labels: data.res.labels,
            isRolling: data.res.isRolling,
            dueDate: data.res.nextDueDate
              ? moment(data.res.nextDueDate).format('YYYY-MM-DDTHH:mm:ss')
              : null,
            updatedBy: data.res.updatedBy,
            isNotificable: data.res.notification,
          })
        })
        .catch(() => {
          this.setState({
            isSnackbarOpen: true,
            snackbarMessage: 'You are not authorized to view this task.',
            snackbarColor: 'danger',
          })

          setTimeout(() => {
            this.props.navigate('/my/tasks')
          }, 3000)
        })
    } else {
      // TODO: Use a more specific ref
      document.querySelector('input')?.focus()
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

  render(): React.ReactNode {
    const { taskId } = this.props
    const {
      name,
      frequency,
      frequencyType,
      frequencyMetadata,
      dueDate,
      isRolling,
      isNotificable,
      labels,
      notificationMetadata,
      userLabels,
      task,
      updatedBy,
      errors,
      isSnackbarOpen,
      snackbarMessage,
      snackbarColor,
      confirmModelConfig,
    } = this.state
    return (
      <Container maxWidth='md'>
        <Box>
          <FormControl error={Boolean(errors.name)}>
            <Typography level='h4'>Description :</Typography>
            <Typography>What is this task about?</Typography>
            <Input
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => this.setState({ name: e.target.value })}
            />
            <FormHelperText>{errors.name}</FormHelperText>
          </FormControl>
        </Box>
        { frequencyMetadata && (
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
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  if (e.target.checked) {
                    this.setState({
                      dueDate: moment(new Date()).format('YYYY-MM-DDTHH:mm:00'),
                    })
                  } else {
                    this.setState({ dueDate: null })
                  }
                }}
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
                  onClick={() => this.setState({ isRolling: false })}
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
                  onClick={() => this.setState({ isRolling: true })}
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                this.setState({ isNotificable: e.target.checked })
              }}
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
                    onClick={() => {
                      this.setState({
                        notificationMetadata: {
                          ...notificationMetadata,
                          [item.type]: !notificationMetadata[item.type],
                        },
                      })
                    }}
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
            onChange={(_: any, newValue: any) => {
              this.setState({
                labels: userLabels.filter(l => newValue.indexOf(l.name) > -1),
              })
            }}
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
              onClick={() => {
                this.labelModalRef.current?.open()
              }}
            >
              <Add />
              Add New Label
            </MenuItem>
          </Select>
        </Box>

        {taskId !== null && task && (
          <Box
            sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 3 }}
          >
            <Sheet
              sx={{
                p: 2,
                borderRadius: 'md',
                boxShadow: 'sm',
              }}
            >
              {(task.updatedAt && updatedBy > 0 && (
                <>
                  <Divider sx={{ my: 1 }} />

                  <Typography>
                    Updated at {moment(task.updatedAt).fromNow()}
                  </Typography>
                </>
              )) || <></>}
            </Sheet>
          </Box>
        )}

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
              onClick={() => {
                this.handleDelete(taskId)
              }}
            >
              Delete
            </Button>
          )}
          <Button
            color='neutral'
            variant='outlined'
            onClick={() => {
              window.history.back()
            }}
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
        <ConfirmationModal {...confirmModelConfig} />
        <LabelModal
          label={null}
          ref={this.labelModalRef}
          onClose={() => console.error('missing impl')}
        />
        <Snackbar
          open={isSnackbarOpen}
          onClose={() => {
            this.setState({
              isSnackbarOpen: false,
              snackbarMessage: null,
            })
          }}
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

export const TaskEdit = withNavigation<TaskEditProps>(TaskEditInner)
