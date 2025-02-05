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
import { GetTaskHistory } from '../../api/tasks'

interface TaskHistoryProps {
  taskId: string
}

interface HistoryInfo {
  icon: React.ReactNode
  text: string
  subtext: string
}

interface TaskHistoryState {
  taskHistory: HistoryEntry[]
  isLoading: boolean
  historyInfo: HistoryInfo[]
}

export class TaskHistory extends React.Component<
  TaskHistoryProps,
  TaskHistoryState
> {
  constructor(props: TaskHistoryProps) {
    super(props)

    this.state = {
      taskHistory: [],
      isLoading: true,
      historyInfo: [],
    }
  }

  componentDidMount(): void {
    GetTaskHistory(this.props.taskId)
      .then(historyData => {
        this.setState({ taskHistory: historyData.res })
        this.updateHistoryInfo(historyData.res)
      })
      .catch(error => {
        console.error('Error fetching data:', error)
      })
      .finally(() => {
        this.setState({ isLoading: false })
      })
  }

  private updateHistoryInfo = (histories: any[]) => {
    // average delay for task completaion from due date:
    const averageDelay =
      histories.reduce((acc, task) => {
        if (task.dueDate && task.completedAt) {
          // Only consider tasks with a due date
          return acc + moment(task.completedAt).diff(task.dueDate, 'hours')
        }
        return acc
      }, 0) / histories.filter(task => task.dueDate).length
    const averageDelayMoment = moment.duration(averageDelay, 'hours')
    const maximumDelay = histories.reduce((acc, task) => {
      if (task.dueDate) {
        // Only consider tasks with a due date
        const delay = moment(task.completedAt).diff(task.dueDate, 'hours')
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
    const { taskHistory, isLoading, historyInfo } = this.state

    if (isLoading) {
      return <Loading />
    }

    if (!taskHistory.length) {
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
            <Link to='/my/tasks'>Go back to tasks</Link>
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
            {taskHistory.map((historyEntry, index) => (
              <HistoryCard
                onClick={() => {}}
                historyEntry={historyEntry}
                allHistory={taskHistory}
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
