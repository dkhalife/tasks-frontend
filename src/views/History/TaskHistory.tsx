import { Loading } from '@/Loading'
import { Checklist, Timelapse, EventBusy } from '@mui/icons-material'
import { Sheet, ListItemContent, Grid } from '@mui/joy'
import { Container, Typography, Button, ListItem, Chip, List } from '@mui/joy'
import React from 'react'
import { Link } from 'react-router-dom'
import { HistoryCard } from './HistoryCard'
import { setTitle } from '@/utils/dom'
import { differenceInHours, formatDuration, intervalToDuration } from 'date-fns'
import { connect } from 'react-redux'
import { AppDispatch, RootState } from '@/store/store'
import { fetchTaskById } from '@/store/tasksSlice'
import { fetchTaskHistory } from '@/store/historySlice'
import { Task } from '@/models/task'
import { HistoryEntryUI } from '@/utils/marshalling'
import { SyncState } from '@/models/sync'

interface TaskHistoryProps {
  taskId: number
  getTaskById: (id: number) => Promise<any>
  fetchTaskHistory: (taskId: number) => Promise<any>
  history: HistoryEntryUI[]
  historyStatus: SyncState
}

interface HistoryInfo {
  icon: React.ReactNode
  text: string
  subtext: string
}

interface TaskHistoryState {
  historyInfo: HistoryInfo[]
}

class TaskHistoryImpl extends React.Component<
  TaskHistoryProps,
  TaskHistoryState
> {
  constructor(props: TaskHistoryProps) {
    super(props)

    this.state = {
      historyInfo: [],
    }
  }

  private loadTask = async () => {
    const task = (await this.props.getTaskById(this.props.taskId)).payload as Task
    setTitle(task.title)
  }

  private loadHistory = async () => {
    const result = await this.props.fetchTaskHistory(this.props.taskId)
    if (result && result.payload) {
      this.updateHistoryInfo(result.payload as HistoryEntryUI[])
    }
  }

  componentDidMount(): void {
    this.loadTask()
    this.loadHistory()
  }

  componentDidUpdate(prevProps: TaskHistoryProps): void {
    if (prevProps.history !== this.props.history) {
      this.updateHistoryInfo(this.props.history)
    }
  }

  private updateHistoryInfo = (histories: HistoryEntryUI[]) => {
    // average delay for task completaion from due date:
    const averageDelay =
      histories.reduce((acc, task) => {
        if (task.due_date && task.completed_date) {
          return acc + differenceInHours(task.completed_date, task.due_date)
        }

        return acc
      }, 0) / histories.filter(task => task.due_date).length

    const maximumDelay = histories.reduce((acc, task) => {
      if (task.due_date && task.completed_date) {
        const delay = differenceInHours(task.completed_date, task.due_date)
        return delay > acc ? delay : acc
      }
      return acc
    }, 0)

    const averageDelayDuration = intervalToDuration({
      start: 0,
      end: averageDelay * 3600 * 1000,
    })

    const maxDelayDuration = intervalToDuration({
      start: 0,
      end: maximumDelay * 3600 * 1000,
    })

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
          subtext: formatDuration(averageDelayDuration),
        },
        {
          icon: <Timelapse />,
          text: 'Maximum Delay',
          subtext: formatDuration(maxDelayDuration),
        },
      ],
    })
  }

  render() {
    const { history: taskHistory, historyStatus } = this.props
    const { historyInfo } = this.state
    if (historyStatus === 'loading') {
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
          level='h4'
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
          level='h4'
          my={1.5}
        >
          History:
        </Typography>
        <Sheet sx={{ borderRadius: 'sm', p: 2, boxShadow: 'md' }}>
          <List sx={{ p: 0 }}>
            {taskHistory.map((historyEntry, index) => (
              <HistoryCard
                key={`history-${index}`}
                historyEntry={historyEntry}
              />
            ))}
          </List>
        </Sheet>
      </Container>
    )
  }
}

const mapStateToProps = (state: RootState) => ({
  history: state.history.entries,
  historyStatus: state.history.status,
})

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  getTaskById: (id: number) => dispatch(fetchTaskById(id)),
  fetchTaskHistory: (taskId: number) => dispatch(fetchTaskHistory(taskId)),
})

export const TaskHistory = connect(
  mapStateToProps,
  mapDispatchToProps,
)(TaskHistoryImpl)
