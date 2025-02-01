import { Checklist, EventBusy, Timelapse } from '@mui/icons-material'
import {
  Button,
  Chip,
  Container,
  Grid,
  List,
  ListItem,
  ListItemContent,
  Sheet,
  Typography,
} from '@mui/joy'
import moment from 'moment'
import React from 'react'
import { Link } from 'react-router-dom'
import { Loading } from '../../Loading'
import { HistoryCard } from './HistoryCard'
import { HistoryEntry } from '../../models/history'
import { GetChoreHistory } from '../../api/chores'

interface ChoreHistoryProps {
  choreId: string | undefined
}

interface HistoryInfo {
  icon: React.ReactNode
  text: string
  subtext: string
}

interface ChoreHistoryState {
  choreHistory: HistoryEntry[]
  isLoading: boolean
  historyInfo: HistoryInfo[]
}

export class ChoreHistory extends React.Component<
  ChoreHistoryProps,
  ChoreHistoryState
> {
  constructor(props) {
    super(props)

    this.state = {
      choreHistory: [],
      isLoading: true,
      historyInfo: [],
    }
  }

  componentDidMount(): void {
    GetChoreHistory(this.props.choreId)
      .then(historyData => {
        this.setState({ choreHistory: historyData.res })
        this.updateHistoryInfo(historyData.res)
      })
      .catch(error => {
        console.error('Error fetching data:', error)
      })
      .finally(() => {
        this.setState({ isLoading: false })
      })
  }

  private updateHistoryInfo = histories => {
    // average delay for task completaion from due date:
    const averageDelay =
      histories.reduce((acc, chore) => {
        if (chore.dueDate && chore.completedAt) {
          // Only consider chores with a due date
          return acc + moment(chore.completedAt).diff(chore.dueDate, 'hours')
        }
        return acc
      }, 0) / histories.filter(chore => chore.dueDate).length
    const averageDelayMoment = moment.duration(averageDelay, 'hours')
    const maximumDelay = histories.reduce((acc, chore) => {
      if (chore.dueDate) {
        // Only consider chores with a due date
        const delay = moment(chore.completedAt).diff(chore.dueDate, 'hours')
        return delay > acc ? delay : acc
      }
      return acc
    }, 0)

    const maxDelayMoment = moment.duration(maximumDelay, 'hours')

    this.setState({
      historyInfo: [
        {
          icon: <Checklist />,
          text: 'Total Completed',
          subtext: `${histories.length} times`,
        },
        {
          icon: <Timelapse />,
          text: 'Usually Within',
          subtext: moment.duration(averageDelayMoment).humanize(),
        },
        {
          icon: <Timelapse />,
          text: 'Maximum Delay',
          subtext: moment.duration(maxDelayMoment).humanize(),
        },
      ],
    })
  }

  render() {
    const { choreHistory, isLoading, historyInfo } = this.state

    if (isLoading) {
      return <Loading />
    }

    if (!choreHistory.length) {
      return (
        <Container
          maxWidth='md'
          sx={{
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            height: '50vh',
          }}
        >
          <EventBusy
            sx={{
              fontSize: '6rem',
              mb: 1,
            }}
          />

          <Typography
            level='h3'
            gutterBottom
          >
            No History Yet
          </Typography>
          <Typography>
            You haven&lsquo;t completed any tasks. Once you start finishing
            tasks, they&lsquo;ll show up here.
          </Typography>
          <Button
            variant='soft'
            sx={{ mt: 2 }}
          >
            <Link to='/my/chores'>Go back to chores</Link>
          </Button>
        </Container>
      )
    }

    return (
      <Container maxWidth='md'>
        <Typography
          level='title-md'
          mb={1.5}
        >
          Summary:
        </Typography>
        <Sheet
          sx={{ borderRadius: 'sm', p: 2 }}
          variant='outlined'
        >
          <Grid
            container
            spacing={1}
          >
            {historyInfo.map((info, index) => (
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
                      {info.text}
                    </Typography>
                    <Chip
                      color='primary'
                      size='md'
                      startDecorator={info.icon}
                    >
                      {info.subtext ? info.subtext : '--'}
                    </Chip>
                  </ListItemContent>
                </ListItem>
              </Grid>
            ))}
          </Grid>
        </Sheet>

        <Typography
          level='title-md'
          my={1.5}
        >
          History:
        </Typography>
        <Sheet sx={{ borderRadius: 'sm', p: 2, boxShadow: 'md' }}>
          <List sx={{ p: 0 }}>
            {choreHistory.map((historyEntry, index) => (
              <HistoryCard
                onClick={() => {}}
                historyEntry={historyEntry}
                allHistory={choreHistory}
                key={index}
                index={index}
              />
            ))}
          </List>
        </Sheet>
      </Container>
    )
  }
}
