import {
  CalendarMonth,
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
  Typography,
} from '@mui/joy'
import moment from 'moment'
import { getTextColorFromBackgroundColor } from '../../utils/Colors'
import {
  ConfirmationModal,
  ConfirmationModalProps,
} from '../Modals/Inputs/ConfirmationModal'
import React from 'react'
import { withNavigation } from '../../contexts/hooks'
import { Chore } from '../../models/chore'
import { MarkChoreComplete, GetChoreDetailById, SkipChore } from '../../api/chores'

interface ChoreViewProps {
  choreId: string | undefined
}

type ChoreViewInnerProps = ChoreViewProps & {
  navigate: (path: string) => void
}

interface InfoCard {
  size: number
  icon: React.ReactNode
  text: string
  subtext: string
}

interface ChoreViewState {
  chore: Chore | null
  infoCards: InfoCard[]
  note: string | null
  confirmModelConfig: ConfirmationModalProps
}

class ChoreViewInner extends React.Component<
  ChoreViewInnerProps,
  ChoreViewState
> {
  private confirmationModalRef = React.createRef<ConfirmationModal>()

  constructor(props) {
    super(props)

    this.state = {
      chore: null,
      infoCards: [],
      note: null,
      confirmModelConfig: {
        title: '',
        message: '',
        confirmText: '',
        cancelText: '',
        onClose: () => {},
      },
    }
  }

  private handleTaskCompletion = async () => {
    const { note } = this.state
    const { choreId } = this.props

    const data = await MarkChoreComplete(choreId, note, null)
    this.setState({
      note: null,
      chore: data.res,
    })

    // TODO: redundant
    const data2 = await GetChoreDetailById(choreId)
    this.setState({
      chore: data2.res,
    })
  }

  componentDidMount(): void {
    GetChoreDetailById(this.props.choreId).then(data => {
      const chore = data.res

      this.setState({
        chore,
      })

      this.generateInfoCards(chore)
    })
  }

  private generateInfoCards = chore => {
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
      },
    ]

    this.setState({
      infoCards: cards,
    })
  }

  private handleSkippingTask = async () => {
    const data = await SkipChore(this.props.choreId)
    this.setState({
      chore: data.res,
    })
  }

  render(): React.ReactNode {
    const { choreId } = this.props
    const { chore, infoCards, confirmModelConfig } = this.state

    // TODO: Chore should just be a prop?
    if (!chore) {
      return null
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
            {chore.title}
          </Typography>
          <Chip
            startDecorator={<CalendarMonth />}
            size='md'
            sx={{ mb: 1 }}
          >
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
            <Grid
              container
              spacing={1}
            >
              {infoCards.map((detail, index) => (
                <Grid
                  xs={4}
                  key={index}
                >
                  <ListItem key={index}>
                    <ListItemContent>
                      <Typography
                        level='body-xs'
                        sx={{ fontWeight: 'md' }}
                      >
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
                this.props.navigate(`/chores/${choreId}/history`)
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
                this.props.navigate(`/chores/${choreId}/edit`)
              }}
            >
              <Edit />
              Edit
            </Button>
          </Box>
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
              onClick={this.handleTaskCompletion}
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
                this.setState({
                  confirmModelConfig: {
                    title: 'Skip Task',

                    message: 'Are you sure you want to skip this task?',

                    confirmText: 'Skip',
                    cancelText: 'Cancel',
                    onClose: confirmed => {
                      if (confirmed) {
                        this.handleSkippingTask()
                      }

                      this.setState({
                        confirmModelConfig: {
                          ...this.state.confirmModelConfig,
                        },
                      })
                    },
                  },
                })

                this.confirmationModalRef.current?.open()
              }}
              startDecorator={<SwitchAccessShortcut />}
              sx={{
                flex: 1,
              }}
            >
              <Box>Skip</Box>
            </Button>
          </Box>

          <ConfirmationModal
            ref={this.confirmationModalRef}
            {...confirmModelConfig} />
        </Card>
      </Container>
    )
  }
}

export const ChoreView = withNavigation<ChoreViewProps>(ChoreViewInner)
