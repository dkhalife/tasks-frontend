import {
  CalendarMonth,
  CancelScheduleSend,
  Check,
  Checklist,
  Edit,
  History,
  PeopleAlt,
  Person,
  SwitchAccessShortcut,
  Timelapse,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Grid,
  ListItem,
  ListItemContent,
  Sheet,
  Snackbar,
  Typography,
} from '@mui/joy'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { notInCompletionWindow } from '../../utils/Chores'
import { getTextColorFromBackgroundColor } from '../../utils/Colors'
import {
  GetAllUsers,
  GetChoreDetailById,
  MarkChoreComplete,
  SkipChore,
} from '../../utils/Fetcher'
import ConfirmationModal from '../Modals/Inputs/ConfirmationModal'
import React from 'react'

const ChoreView = () => {
  const [chore, setChore] = useState({})
  const navigate = useNavigate()
  const [performers, setPerformers] = useState([])
  const [infoCards, setInfoCards] = useState([])
  const { choreId } = useParams()
  const [note, setNote] = useState(null)

  const [searchParams] = useSearchParams()

  const [isPendingCompletion, setIsPendingCompletion] = useState(false)
  const [timeoutId, setTimeoutId] = useState(null)
  const [secondsLeftToCancel, setSecondsLeftToCancel] = useState(null)
  const [completedDate, setCompletedDate] = useState(null)
  const [confirmModelConfig, setConfirmModelConfig] = useState({})
  useEffect(() => {
    Promise.all([
      GetChoreDetailById(choreId).then(resp => {
        if (resp.ok) {
          return resp.json().then(data => {
            setChore(data.res)
            document.title = 'Donetick: ' + data.res.name
          })
        }
      }),
      GetAllUsers()
        .then(response => response.json())
        .then(data => {
          setPerformers(data.res)
        }),
    ])
    const auto_complete = searchParams.get('auto_complete')
    if (auto_complete === 'true') {
      handleTaskCompletion()
    }
  }, [])
  useEffect(() => {
    if (chore && performers.length > 0) {
      generateInfoCards(chore)
    }
  }, [chore, performers])

  const generateInfoCards = chore => {
    const cards = [
      {
        size: 6,
        icon: <PeopleAlt />,
        text: 'Assigned To',
        subtext: performers.find(p => p.id === chore.assignedTo)?.displayName,
      },
      {
        size: 6,
        icon: <CalendarMonth />,
        text: 'Due Date',
        subtext: chore.nextDueDate
          ? moment(chore.nextDueDate).fromNow()
          : 'N/A',
      },
      {
        size: 6,
        icon: <Checklist />,
        text: 'Total Completed',
        subtext: `${chore.totalCompletedCount} times`,
      },
      {
        size: 6,
        icon: <Timelapse />,
        text: 'Last Completed',
        subtext:
          chore.lastCompletedDate && moment(chore.lastCompletedDate).fromNow(),
      },
      {
        size: 6,
        icon: <Person />,
        text: 'Last Performer',
        subtext: chore.lastCompletedDate
          ? `${
              performers.find(p => p.id === chore.lastCompletedBy)?.displayName
            }`
          : '--',
      },
      {
        size: 6,
        icon: <Person />,
        text: 'Created By',
        subtext: performers.find(p => p.id === chore.createdBy)?.displayName,
      },
    ]
    setInfoCards(cards)
  }
  const handleTaskCompletion = () => {
    setIsPendingCompletion(true)
    let seconds = 3 // Starting countdown from 3 seconds
    setSecondsLeftToCancel(seconds)

    const countdownInterval = setInterval(() => {
      seconds -= 1
      setSecondsLeftToCancel(seconds)

      if (seconds <= 0) {
        clearInterval(countdownInterval) // Stop the countdown when it reaches 0
      }
    }, 1000)

    const id = setTimeout(() => {
      MarkChoreComplete(choreId, note, completedDate, null)
        .then(resp => {
          if (resp.ok) {
            return resp.json().then(data => {
              setNote(null)
              setChore(data.res)
            })
          }
        })
        .then(() => {
          setIsPendingCompletion(false)
          clearTimeout(id)
          clearInterval(countdownInterval) // Ensure to clear this interval as well
          setTimeoutId(null)
          setSecondsLeftToCancel(null)
        })
        .then(() => {
          // refetch the chore details
          GetChoreDetailById(choreId).then(resp => {
            if (resp.ok) {
              return resp.json().then(data => {
                setChore(data.res)
              })
            }
          })
        })
    }, 3000)

    setTimeoutId(id)
  }
  const handleSkippingTask = () => {
    SkipChore(choreId).then(response => {
      if (response.ok) {
        response.json().then(data => {
          const newChore = data.res
          setChore(newChore)
        })
      }
    })
  }
  return (
    <Container
      maxWidth='sm'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        // space between :
        justifyContent: 'space-between',
        // max height of the container:
        maxHeight: 'calc(100vh - 500px)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography
          level='h3'
          // textAlign={'center'}
          sx={{
            mt: 1,
            mb: 0.5,
          }}
        >
          {chore.name}
        </Typography>
        <Chip startDecorator={<CalendarMonth />} size='md' sx={{ mb: 1 }}>
          {chore.nextDueDate
            ? `Due at ${moment(chore.nextDueDate).format('MM/DD/YYYY hh:mm A')}`
            : 'N/A'}
        </Chip>
        {chore?.labelsV2?.map((label, index) => (
          <Chip
            key={index}
            sx={{
              position: 'relative',
              ml: index === 0 ? 0 : 0.5,
              top: 2,
              zIndex: 1,
              backgroundColor: label?.color,
              color: getTextColorFromBackgroundColor(label?.color),
            }}
          >
            {label?.name}
          </Chip>
        ))}
      </Box>
      <Box>
        <Sheet
          sx={{
            mb: 1,
            borderRadius: 'lg',
            p: 2,
          }}
          variant='outlined'
        >
          <Grid container spacing={1}>
            {infoCards.map((detail, index) => (
              <Grid item xs={6} key={index}>
                {/* divider between the list items: */}

                <ListItem key={index}>
                  <ListItemContent>
                    <Typography level='body-xs' sx={{ fontWeight: 'md' }}>
                      {detail.text}
                    </Typography>
                    <Chip
                      color='primary'
                      size='md'
                      startDecorator={detail.icon}
                    >
                      {detail.subtext ? detail.subtext : '--'}
                    </Chip>
                  </ListItemContent>
                </ListItem>
              </Grid>
            ))}
          </Grid>
        </Sheet>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 1,
            alignContent: 'center',
            justifyContent: 'center',
            mb: 1,
          }}
        >
          <Button
            size='sm'
            color='neutral'
            variant='outlined'
            fullWidth
            onClick={() => {
              navigate(`/chores/${choreId}/history`)
            }}
            sx={{
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 1,
            }}
          >
            <History />
            History
          </Button>
          <Button
            size='sm'
            color='neutral'
            variant='outlined'
            fullWidth
            sx={{
              // top right of the card:
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 1,
            }}
            onClick={() => {
              navigate(`/chores/${choreId}/edit`)
            }}
          >
            <Edit />
            Edit
          </Button>
        </Box>

        {chore.notes && (
          <>
            <Typography level='title-md' sx={{ mb: 1 }}>
              Previous note:
            </Typography>
            <Sheet variant='outlined' sx={{ p: 2, borderRadius: 'lg' }}>
              <Typography level='body-md' sx={{ mb: 1 }}>
                {chore.notes || '--'}
              </Typography>
            </Sheet>
          </>
        )}
      </Box>

      <Card
        sx={{
          p: 2,
          borderRadius: 'md',
          boxShadow: 'sm',
          mt: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 1,
            alignContent: 'center',
            justifyContent: 'center',
          }}
        >
          <Button
            fullWidth
            size='lg'
            onClick={handleTaskCompletion}
            disabled={isPendingCompletion || notInCompletionWindow(chore)}
            color={isPendingCompletion ? 'danger' : 'success'}
            startDecorator={<Check />}
            sx={{
              flex: 4,
            }}
          >
            <Box>Mark as done</Box>
          </Button>

          <Button
            fullWidth
            size='lg'
            onClick={() => {
              setConfirmModelConfig({
                isOpen: true,
                title: 'Skip Task',

                message: 'Are you sure you want to skip this task?',

                confirmText: 'Skip',
                cancelText: 'Cancel',
                onClose: confirmed => {
                  if (confirmed) {
                    handleSkippingTask()
                  }
                  setConfirmModelConfig({})
                },
              })
            }}
            startDecorator={<SwitchAccessShortcut />}
            sx={{
              flex: 1,
            }}
          >
            <Box>Skip</Box>
          </Button>
        </Box>

        <Snackbar
          open={isPendingCompletion}
          endDecorator={
            <Button
              onClick={() => {
                if (timeoutId) {
                  clearTimeout(timeoutId)
                  setIsPendingCompletion(false)
                  setTimeoutId(null)
                  setSecondsLeftToCancel(null) // Reset or adjust as needed
                }
              }}
              size='lg'
              variant='outlined'
              color='danger'
              startDecorator={<CancelScheduleSend />}
            >
              Cancel
            </Button>
          }
        >
          <Typography level='body-md' textAlign={'center'}>
            Task will be marked as completed in {secondsLeftToCancel} seconds
          </Typography>
        </Snackbar>
        <ConfirmationModal config={confirmModelConfig} />
      </Card>
    </Container>
  )
}

export default ChoreView
