import { Add } from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
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
  CreateChore,
  DeleteChore,
  GetChoreByID,
  SaveChore,
} from '../../utils/Fetcher'
import { ConfirmationModal, ConfirmationModalProps } from '../Modals/Inputs/ConfirmationModal'
import { LabelModal } from '../Modals/Inputs/LabelModal'
import React from 'react'
import { RepeatOption } from './RepeatSection'
import { withNavigation } from '../../contexts/hooks'

const REPEAT_ON_TYPE = ['interval', 'days_of_the_week', 'day_of_the_month']
const NO_DUE_DATE_REQUIRED_TYPE = ['no_repeat', 'once']
const NO_DUE_DATE_ALLOWED_TYPE = ['trigger']

interface ChoreEditProps {
  choreId: string | undefined
}

type ChoreEditInnerProps = ChoreEditProps & {
  navigate: (path: string) => void
}

// TODO: Some of these should be props
interface ChoreEditState {
  isRolling: boolean
  isNotificable: boolean
  updatedBy: number
  errors: any
  isSnackbarOpen: boolean
  snackbarMessage: any
  snackbarColor: string
  addLabelModalOpen: boolean
  dueDate: any
  frequencyType: string
  frequency: number
  frequencyMetadata: any
  labels: any[]
  notificationMetadata: any
  userLabels: any[]
  chore: any
  name: string
  confirmModelConfig: ConfirmationModalProps
}

class ChoreEditInner extends React.Component<ChoreEditInnerProps, ChoreEditState> {
  constructor(props: ChoreEditInnerProps) {
    super(props)
    this.state = {
      isRolling: false,
      isNotificable: false,
      updatedBy: 0,
      errors: {},
      isSnackbarOpen: false,
      snackbarMessage: null,
      snackbarColor: 'warning',
      addLabelModalOpen: false,
      dueDate: null,
      frequencyType: 'once',
      frequency: 1,
      frequencyMetadata: {},
      labels: [],
      notificationMetadata: {},
      userLabels: [],
      chore: {},
      name: '',
      confirmModelConfig: {
        cancelText: '',
        confirmText: '',
        isOpen: false,
        message: '',
        onClose: () => {},
        title: '',
      }
    }
  }

  private HandleValidateChore = () => {
    const { name, frequencyType, frequency, frequencyMetadata, dueDate } = this.state
    const errors: { [key: string]: string } = {}

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
    const newState: any = {
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

  private handleDueDateChange = e => {
    this.setState({ dueDate: e.target.value })
  }

  private HandleSaveChore = () => {
    if (!this.HandleValidateChore()) {
      return
    }

    const { choreId } = this.props
    const { name, frequencyType, frequency, frequencyMetadata, dueDate, isRolling, isNotificable, labels, notificationMetadata } = this.state
    const chore = {
      id: Number(choreId),
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

    let SaveFunction = CreateChore
    if (choreId !== undefined) {
      SaveFunction = SaveChore
    }

    SaveFunction(chore).then(response => {
      if (response.status === 200) {
        this.props.navigate(`/my/chores`)
      } else {
        this.setState({
          isSnackbarOpen: true,
          snackbarMessage: 'Failed to save chore',
          snackbarColor: 'danger',
        })
      }
    })
  }

  private handleDelete = () => {
    const { choreId } = this.props
    this.setState({
      confirmModelConfig: {
        isOpen: true,
        title: 'Delete Chore',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        message: 'Are you sure you want to delete this chore?',
        onClose: isConfirmed => {
          if (isConfirmed === true) {
            DeleteChore(choreId).then(response => {
              if (response.status === 200) {
                this.props.navigate('/my/chores')
              } else {
                this.setState({
                  isSnackbarOpen: true,
                  snackbarMessage: 'Failed to delete chore',
                  snackbarColor: 'danger',
                })
              }
            })
          }
          
          this.setState({
            confirmModelConfig: {
              isOpen: false,
              title: '',
              confirmText: '',
              cancelText: '',
              message: '',
              onClose: () => {},
            }
          })
        },
      }
    })
  }

  componentDidMount(): void {
    // TODO: Load and set labels and userLabels

    // Load chore data
    const { choreId } = this.props
    if (choreId != undefined) {
      GetChoreByID(choreId)
        .then(response => {
          if (response.status !== 200) {
            this.setState({
              isSnackbarOpen: true,
              snackbarMessage: 'You are not authorized to view this chore.',
              snackbarColor: 'danger',
            })

            setTimeout(() => {
              this.props.navigate('/my/chores')
            }, 3000);
            return null
          } else {
            return response.json()
          }
        })
        .then(data => {
          // TODO: There is so much redundancy here
          this.setState({
            chore: data.res,
            name: data.res.name ? data.res.name : '',
            frequencyType: data.res.frequencyType ? data.res.frequencyType : 'once',
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
    }
    else {
      // TODO: Use a more specific ref
      document.querySelector('input')?.focus()
    }
  }

  componentDidUpdate(prevProps: Readonly<ChoreEditProps>, prevState: Readonly<ChoreEditState>): void {
    const { frequencyType, dueDate } = this.state

    if (frequencyType !== prevState.frequencyType) {
      // if frequancy type change to somthing need a due date then set it to the current date:
      if (!NO_DUE_DATE_REQUIRED_TYPE.includes(frequencyType) && !dueDate) {
        this.setState({
          dueDate: moment(new Date()).format('YYYY-MM-DDTHH:mm:00'),
        })
      }
      else if (NO_DUE_DATE_ALLOWED_TYPE.includes(frequencyType)) {
        this.setState({
          dueDate: null,
        })
      }    
    }
  }

  render(): React.ReactNode {
    const { choreId } = this.props
    const { name, frequency, frequencyType, frequencyMetadata, dueDate, isRolling, isNotificable, labels, notificationMetadata, userLabels, chore, updatedBy, errors, isSnackbarOpen, snackbarMessage, snackbarColor, addLabelModalOpen, confirmModelConfig } = this.state
    return (
      <Container maxWidth='md'>
        <Box>
          <FormControl error={errors.name}>
            <Typography level='h4'>Description :</Typography>
            <Typography>What is this chore about?</Typography>
            <Input value={name} onChange={e => this.setState({ name: e.target.value })} />
            <FormHelperText>{errors.name}</FormHelperText>
          </FormControl>
        </Box>
        <RepeatOption
          frequency={frequency}
          onFrequencyUpdate={(newFrequency) => this.setState({ frequency: newFrequency })}
          frequencyType={frequencyType}
          onFrequencyTypeUpdate={(newFrequencyType) => this.setState({ frequencyType: newFrequencyType })}
          frequencyMetadata={frequencyMetadata}
          onFrequencyMetadataUpdate={(newFrequencyMetadata) => this.setState({ frequencyMetadata: newFrequencyMetadata })}
          onFrequencyTimeUpdate={t => {
            this.setState({ frequencyMetadata: { ...frequencyMetadata, time: t } })
          }}
          frequencyError={errors?.frequency}
        />

        <Box mt={2}>
          <Typography level='h4'>
            {REPEAT_ON_TYPE.includes(frequencyType) ? 'Start date' : 'Due date'} :
          </Typography>
          {frequencyType === 'trigger' && !dueDate && (
            <Typography level='body-sm'>
              Due Date will be set when the trigger of the thing is met
            </Typography>
          )}

          {NO_DUE_DATE_REQUIRED_TYPE.includes(frequencyType) && (
            <FormControl sx={{ mt: 1 }}>
              <Checkbox
                onChange={e => {
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
                  ? 'When does this chore start?'
                  : 'When is the next first time this chore is due?'}
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
            <Typography>
              How to reschedule the next due date?
            </Typography>

            <RadioGroup name='tiers' sx={{ gap: 1, '& > div': { p: 1 } }}>
              <FormControl>
                <Radio
                  overlay
                  checked={!isRolling}
                  onClick={() => this.setState({ isRolling: false })}
                  label='Reschedule from due date'
                />
                <FormHelperText>
                  the next task will be scheduled from the original due date, even
                  if the previous task was completed late
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
                  the next task will be scheduled from the actual completion date
                  of the previous task
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
              onChange={e => {
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
              <Typography>
                What should trigger the notification?
              </Typography>
              {[
                {
                  title: 'Due Date/Time',
                  description: 'A simple reminder that a task is due',
                  id: 'dueDate',
                },
                {
                  title: 'Predued',
                  description: 'before a task is due in few hours',
                  id: 'predue',
                },
                {
                  title: 'Overdue',
                  description: 'A notification when a task is overdue',
                  id: 'overdue',
                },
                {
                  title: 'Nagging',
                  description: 'Daily reminders until the task is completed',
                  id: 'nagging',
                },
              ].map(item => (
                <FormControl sx={{ mb: 1 }} key={item.id}>
                  <Checkbox
                    overlay
                    onClick={() => {
                      this.setState({
                        notificationMetadata: {
                          ...notificationMetadata,
                          [item.id]: !notificationMetadata[item.id],
                        },
                      })
                    }}
                    checked={
                      notificationMetadata ? notificationMetadata[item.id] : false
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
            Things to remember about this chore or to tag it
          </Typography>
          <Select
            multiple
            onChange={(event, newValue) => {
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
              userLabels
                .map(label => (
                  <Option key={label.id + label.name} value={label.name}>
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
                this.setState({
                  addLabelModalOpen: true
                })
              }}
            >
              <Add />
              Add New Label
            </MenuItem>
          </Select>
        </Box>

        {choreId !== undefined && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 3 }}>
            <Sheet
              sx={{
                p: 2,
                borderRadius: 'md',
                boxShadow: 'sm',
              }}
            >
              {(chore.updatedAt && updatedBy > 0 && (
                <>
                  <Divider sx={{ my: 1 }} />

                  <Typography>
                    Updated at {moment(chore.updatedAt).fromNow()}
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
          {choreId != undefined && (
            <Button
              color='danger'
              variant='solid'
              onClick={() => {
                this.handleDelete()
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
          <Button color='primary' variant='solid' onClick={this.HandleSaveChore}>
            {choreId != undefined ? 'Save' : 'Create'}
          </Button>
        </Sheet>
        <ConfirmationModal {...confirmModelConfig} />
        {addLabelModalOpen && (
          <LabelModal
            isOpen={addLabelModalOpen}
            label={null /* TODO: Verify */}
            onClose={() => this.setState({ addLabelModalOpen: false })}
          />
        )}
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

export const ChoreEdit = withNavigation<ChoreEditProps>(ChoreEditInner)
