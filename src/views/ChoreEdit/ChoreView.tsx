import {
  CalendarMonth,
  CancelScheduleSend,
  Check,
  Checklist,
  Edit,
  History,
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
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getTextColorFromBackgroundColor } from '../../utils/Colors'
import {
  GetChoreDetailById,
  MarkChoreComplete,
  SkipChore,
} from '../../utils/Fetcher'
import { ConfirmationModal } from '../Modals/Inputs/ConfirmationModal'
import React from 'react'

export const ChoreView = () => {
  const [chore, setChore] = useState<any>({})
  const navigate = useNavigate()
  const [infoCards, setInfoCards] = useState([])
  const { choreId } = useParams()
  const [note, setNote] = useState(null)

  const [searchParams] = useSearchParams()

  const [secondsLeftToCancel, setSecondsLeftToCancel] = useState<number | null>(null)
  const [completedDate, setCompletedDate] = useState(null)
  const [confirmModelConfig, setConfirmModelConfig] = useState({})

  const handleTaskCompletion = useCallback(() => {
    MarkChoreComplete(choreId, note, completedDate)
      .then(resp => {
        if (resp.ok) {
          return resp.json().then(data => {
            setNote(null)
            setChore(data.res)
          })
        }
      })
      .then(() => {
        GetChoreDetailById(choreId).then(resp => {
          if (resp.ok) {
            return resp.json().then(data => {
              setChore(data.res)
            })
          }
        })
      })
  }, [MarkChoreComplete, GetChoreDetailById, setNote, setChore, choreId, note, completedDate])

  useEffect(() => {
    GetChoreDetailById(choreId).then(resp => {
      if (resp.ok) {
        return resp.json().then(data => {
          setChore(data.res)
          document.title = 'Donetick: ' + data.res.name
        })
      }
    })
    const auto_complete = searchParams.get('auto_complete')
    if (auto_complete === 'true') {
      handleTaskCompletion()
    }
  }, [choreId, handleTaskCompletion, searchParams])

  useEffect(() => {

    const generateInfoCards = chore => {
      const cards = [
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
        }
      ]
      setInfoCards(cards)
    }

    generateInfoCards(chore)
  }, [chore])

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
        justifyContent: 'space-between',
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
        {chore?.labels?.map((label, index) => (
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
              <Grid item xs={4} key={index}>
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
            color={'success'}
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

        <ConfirmationModal config={confirmModelConfig} />
      </Card>
    </Container>
  )
}
