import { MarkTaskComplete, GetTaskDetailById, SkipTask } from '@/api/tasks'
import { withNavigation } from '@/contexts/hooks'
import { Task } from '@/models/task'
import { getTextColorFromBackgroundColor } from '@/utils/Colors'
import {
  CalendarMonth,
  Checklist,
  Timelapse,
  Edit,
  Check,
  SwitchAccessShortcut,
  History,
} from '@mui/icons-material'
import {
  Container,
  Box,
  Typography,
  Chip,
  Sheet,
  Grid,
  ListItem,
  ListItemContent,
  Button,
  Card,
} from '@mui/joy'
import moment from 'moment'
import React from 'react'
import { ConfirmationModal } from '@/views/Modals/Inputs/ConfirmationModal'

interface TaskViewProps {
  taskId: string
}

type TaskViewInnerProps = TaskViewProps & {
  navigate: (path: string) => void
}

interface InfoCard {
  size: number
  icon: React.ReactNode
  text: string
  subtext: string
}

interface TaskViewState {
  task: Task | null
  infoCards: InfoCard[]
}

class TaskViewInner extends React.Component<TaskViewInnerProps, TaskViewState> {
  private confirmationModalRef = React.createRef<ConfirmationModal>()

  constructor(props: TaskViewInnerProps) {
    super(props)

    this.state = {
      task: null,
      infoCards: [],
    }
  }

  private handleTaskCompletion = async () => {
    const { taskId } = this.props
    if (!taskId) {
      return
    }

    const data = await MarkTaskComplete(taskId, null)
    this.setState({
      task: data.task,
    })

    // TODO: redundant
    const data2: any = await GetTaskDetailById(taskId)
    this.setState({
      task: data2.taskDetail,
    })
  }

  private loadTaskDetail = async () => {
    const data = await GetTaskDetailById(this.props.taskId)
    const task: Task = (data as any).taskDetail

    this.setState({
      task,
    })

    this.generateInfoCards(task)
  }

  componentDidMount(): void {
    this.loadTaskDetail()
  }

  private generateInfoCards = (task: any) => {
    const cards = [
      {
        size: 6,
        icon: <CalendarMonth />,
        text: 'Due Date',
        subtext: task.nextDueDate ? moment(task.nextDueDate).fromNow() : 'N/A',
      },
      {
        size: 6,
        icon: <Checklist />,
        text: 'Total Completed',
        subtext: `${task.totalCompletedCount} times`,
      },
      {
        size: 6,
        icon: <Timelapse />,
        text: 'Last Completed',
        subtext:
          task.lastCompletedDate && moment(task.lastCompletedDate).fromNow(),
      },
    ]

    this.setState({
      infoCards: cards,
    })
  }

  private handleSkippingTask = async () => {
    const data = await SkipTask(this.props.taskId)
    this.setState({
      task: data.res,
    })
  }

  private goToTaskHistory = (taskId: string) => {
    this.props.navigate(`/tasks/${taskId}/history`)
  }

  private goToTaskEdit = (taskId: string) => {
    this.props.navigate(`/tasks/${taskId}/edit`)
  }

  private onConfirmSkip = (confirmed: boolean) => {
    if (confirmed) {
      this.handleSkippingTask()
    }
  }

  private onSkipTask = () => {
    this.confirmationModalRef.current?.open()
  }

  render(): React.ReactNode {
    const { taskId } = this.props
    const { task, infoCards } = this.state

    // TODO: Task should just be a prop?
    if (!task) {
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
            {task.title}
          </Typography>
          <Chip
            startDecorator={<CalendarMonth />}
            size='md'
            sx={{ mb: 1 }}
          >
            {task.nextDueDate
              ? `Due at ${moment(task.nextDueDate).format('MM/DD/YYYY hh:mm A')}`
              : 'N/A'}
          </Chip>
          {task?.labels?.map((label, index) => (
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
              onClick={() => this.goToTaskHistory(taskId)}
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
              onClick={() => this.goToTaskEdit(taskId)}
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
              onClick={this.onSkipTask}
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
            title='Skip Task'
            message='Are you sure you want to skip this task?'
            confirmText='Skip'
            cancelText='Cancel'
            onClose={this.onConfirmSkip}
          />
        </Card>
      </Container>
    )
  }
}

export const TaskView = withNavigation(TaskViewInner)
