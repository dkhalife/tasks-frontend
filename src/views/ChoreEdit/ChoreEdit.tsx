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
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getTextColorFromBackgroundColor } from '../../utils/Colors'
import {
  CreateChore,
  DeleteChore,
  GetChoreByID,
  GetChoreHistory,
  SaveChore,
} from '../../utils/Fetcher'
import { useLabels } from '../Labels/LabelQueries'
import { ConfirmationModal } from '../Modals/Inputs/ConfirmationModal'
import { LabelModal } from '../Modals/Inputs/LabelModal'
import { RepeatSection } from './RepeatSection'
import React from 'react'
const REPEAT_ON_TYPE = ['interval', 'days_of_the_week', 'day_of_the_month']

const NO_DUE_DATE_REQUIRED_TYPE = ['no_repeat', 'once']
const NO_DUE_DATE_ALLOWED_TYPE = ['trigger']

export const ChoreEdit = () => {
  const [chore, setChore] = useState([])
  const { choreId } = useParams()
  const [name, setName] = useState('')
  const [confirmModelConfig, setConfirmModelConfig] = useState({})
  const [dueDate, setDueDate] = useState<any>(null)
  const [frequencyType, setFrequencyType] = useState('once')
  const [frequency, setFrequency] = useState(1)
  const [frequencyMetadata, setFrequencyMetadata] = useState<any>({})
  const [labels, setLabels] = useState([])

  const [notificationMetadata, setNotificationMetadata] = useState({})

  const [isRolling, setIsRolling] = useState(false)
  const [isNotificable, setIsNotificable] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [updatedBy, setUpdatedBy] = useState(0)
  const [createdBy, setCreatedBy] = useState(0)
  const [errors, setErrors] = useState({})
  const [attemptToSave, setAttemptToSave] = useState(false)
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState<any>(null)
  const [snackbarColor, setSnackbarColor] = useState('warning')
  const [addLabelModalOpen, setAddLabelModalOpen] = useState(false)
  const { data: userLabelsRaw, isLoading: isUserLabelsLoading } = useLabels()

  const [userLabels, setUserLabels] = useState([])

  useEffect(() => {
    if (userLabelsRaw) {
      setUserLabels(userLabelsRaw)
    }
  }, [userLabelsRaw])

  const navigate = useNavigate()

  const HandleValidateChore = () => {
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
    setErrors(errors)
    if (Object.keys(errors).length > 0) {
      // generate a list with error and set it in snackbar:

      const errorList = Object.keys(errors).map(key => (
        <ListItem key={key}>{errors[key]}</ListItem>
      ))
      setSnackbarMessage(
        <Stack spacing={0.5}>
          <Typography level='title-md'>
            Please resolve the following errors:
          </Typography>
          <List>{errorList}</List>
        </Stack>,
      )
      setSnackbarColor('danger')
      setIsSnackbarOpen(true)
      return false
    }

    return true
  }

  const handleDueDateChange = e => {
    setDueDate(e.target.value)
  }
  const HandleSaveChore = () => {
    setAttemptToSave(true)
    if (!HandleValidateChore()) {
      return
    }
    const chore = {
      id: Number(choreId),
      name: name,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      frequencyType: frequencyType,
      frequency: Number(frequency),
      frequencyMetadata: frequencyMetadata,
      isRolling: isRolling,
      isActive: isActive,
      notification: isNotificable,
      labels: labels,
      notificationMetadata: notificationMetadata,
    }
    let SaveFunction = CreateChore
    if (choreId > 0) {
      SaveFunction = SaveChore
    }

    SaveFunction(chore).then(response => {
      if (response.status === 200) {
        navigate(`/my/chores`)
      } else {
        alert('Failed to save chore')
      }
    })
  }
  useEffect(() => {
    if (choreId > 0) {
      GetChoreByID(choreId)
        .then(response => {
          if (response.status !== 200) {
            alert('You are not authorized to view this chore.')
            navigate('/my/chores')
            return null
          } else {
            return response.json()
          }
        })
        .then(data => {
          setChore(data.res)
          setName(data.res.name ? data.res.name : '')
          setFrequencyType(
            data.res.frequencyType ? data.res.frequencyType : 'once',
          )

          setFrequencyMetadata(JSON.parse(data.res.frequencyMetadata))
          setFrequency(data.res.frequency)

          setNotificationMetadata(JSON.parse(data.res.notificationMetadata))

          setLabels(data.res.labels)
          setIsRolling(data.res.isRolling)
          setIsActive(data.res.isActive)
          // parse the due date to a string from this format "2021-10-10T00:00:00.000Z"
          // use moment.js or date-fns to format the date for to be usable in the input field:
          setDueDate(
            data.res.nextDueDate
              ? moment(data.res.nextDueDate).format('YYYY-MM-DDTHH:mm:ss')
              : null,
          )
          setUpdatedBy(data.res.updatedBy)
          setCreatedBy(data.res.createdBy)
          setIsNotificable(data.res.notification)
          // setDueDate(data.res.dueDate)
          // setCompleted(data.res.completed)
          // setCompletedDate(data.res.completedDate)
        })
    }
    // set focus on the first input field:
    else {
      // new task/ chore set focus on the first input field:
      document.querySelector('input')?.focus()
    }
  }, [navigate, choreId])

  useEffect(() => {
    // if frequancy type change to somthing need a due date then set it to the current date:
    if (!NO_DUE_DATE_REQUIRED_TYPE.includes(frequencyType) && !dueDate) {
      setDueDate(moment(new Date()).format('YYYY-MM-DDTHH:mm:00'))
    }
    if (NO_DUE_DATE_ALLOWED_TYPE.includes(frequencyType)) {
      setDueDate(null)
    }
  }, [frequencyType, dueDate])

  // if user resolve the error trigger validation to remove the error message from the respective field
  useEffect(() => {
    if (attemptToSave) {
      HandleValidateChore()
    }
  }, [name, frequencyMetadata, attemptToSave, dueDate])

  const handleDelete = () => {
    setConfirmModelConfig({
      isOpen: true,
      title: 'Delete Chore',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      message: 'Are you sure you want to delete this chore?',
      onClose: isConfirmed => {
        if (isConfirmed === true) {
          DeleteChore(choreId).then(response => {
            if (response.status === 200) {
              navigate('/my/chores')
            } else {
              alert('Failed to delete chore')
            }
          })
        }
        setConfirmModelConfig({})
      },
    })
  }

  return (
    <Container maxWidth='md'>
      <Box>
        <FormControl error={errors.name}>
          <Typography level='h4'>Description :</Typography>
          <Typography level='h5'>What is this chore about?</Typography>
          <Input value={name} onChange={e => setName(e.target.value)} />
          <FormHelperText>{errors.name}</FormHelperText>
        </FormControl>
      </Box>
      <RepeatSection
        frequency={frequency}
        onFrequencyUpdate={setFrequency}
        frequencyType={frequencyType}
        onFrequencyTypeUpdate={setFrequencyType}
        frequencyMetadata={frequencyMetadata}
        onFrequencyMetadataUpdate={setFrequencyMetadata}
        onFrequencyTimeUpdate={t => {
          setFrequencyMetadata({
            ...frequencyMetadata,
            time: t,
          })
        }}
        frequencyError={errors?.frequency}
        isAttemptToSave={attemptToSave}
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
                  setDueDate(moment(new Date()).format('YYYY-MM-DDTHH:mm:00'))
                } else {
                  setDueDate(null)
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
            <Typography level='h5'>
              {REPEAT_ON_TYPE.includes(frequencyType)
                ? 'When does this chore start?'
                : 'When is the next first time this chore is due?'}
            </Typography>
            <Input
              type='datetime-local'
              value={dueDate}
              onChange={handleDueDateChange}
            />
            <FormHelperText>{errors.dueDate}</FormHelperText>
          </FormControl>
        )}
      </Box>
      {!['once', 'no_repeat'].includes(frequencyType) && (
        <Box mt={2}>
          <Typography level='h4'>Scheduling Preferences: </Typography>
          <Typography level='h5'>
            How to reschedule the next due date?
          </Typography>

          <RadioGroup name='tiers' sx={{ gap: 1, '& > div': { p: 1 } }}>
            <FormControl>
              <Radio
                overlay
                checked={!isRolling}
                onClick={() => setIsRolling(false)}
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
                onClick={() => setIsRolling(true)}
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
        <Typography level='h5'>
          Get Reminders when this task is due or completed
        </Typography>

        <FormControl sx={{ mt: 1 }}>
          <Checkbox
            onChange={e => {
              setIsNotificable(e.target.checked)
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
            <Typography level='h5'>
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
                    setNotificationMetadata({
                      ...notificationMetadata,
                      [item.id]: !notificationMetadata[item.id],
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
        <Typography level='h5'>
          Things to remember about this chore or to tag it
        </Typography>
        <Select
          multiple
          onChange={(event, newValue) => {
            setLabels(userLabels.filter(l => newValue.indexOf(l.name) > -1))
          }}
          value={labels.map(l => l.name)}
          renderValue={selected => (
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
            value={' New Label'}
            onClick={() => {
              setAddLabelModalOpen(true)
            }}
          >
            <Add />
            Add New Label
          </MenuItem>
        </Select>
      </Box>

      {choreId > 0 && (
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

                <Typography level='body1'>
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
        {choreId > 0 && (
          <Button
            color='danger'
            variant='solid'
            onClick={() => {
              handleDelete()
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
        <Button color='primary' variant='solid' onClick={HandleSaveChore}>
          {choreId > 0 ? 'Save' : 'Create'}
        </Button>
      </Sheet>
      <ConfirmationModal config={confirmModelConfig} />
      {addLabelModalOpen && (
        <LabelModal
          isOpen={addLabelModalOpen}
          onSave={label => {
            const newLabels = [...labels]
            newLabels.push(label)
            setUserLabels([...userLabels, label])

            setLabels([...labels, label])
            setAddLabelModalOpen(false)
          }}
          onClose={() => setAddLabelModalOpen(false)}
        />
      )}
      <Snackbar
        open={isSnackbarOpen}
        onClose={() => {
          setIsSnackbarOpen(false)
          setSnackbarMessage(null)
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
