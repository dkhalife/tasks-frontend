import { GetTaskByID, MarkTaskComplete, SkipTask } from '@/api/tasks'
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
import { goToTaskEdit, goToTaskHistory } from '@/utils/navigation'

interface TaskViewProps {
  taskId: string
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

export class TaskView extends React.Component<TaskViewProps, TaskViewState> {
  private confirmationModalRef = React.createRef<ConfirmationModal>()

  constructor(props: TaskViewProps) {
    super(props)

    this.state = {
      task: null,
      infoCards: [],
    }
  }

  private handleTaskCompletion = async () => {
    const { task } = this.state
    if (!task) {
      return
    }

    const data = await MarkTaskComplete(task.id, null)
    this.setState({
      task: data.task,
    })
  }

  private initTask = async () => {
    const data = await GetTaskByID(this.props.taskId)
    this.setState({
      task: data.task,
    })

    this.generateInfoCards(data.task)
  }

  componentDidMount(): void {
    this.initTask()
  }

  // TODO: type hardening
  private generateInfoCards = (task: any) => {
    const cards = [
      {
        size: 6,
        icon: <CalendarMonth />,
        text: 'Due Date',
        subtext: task.next_due_date ? moment(task.next_due_date).fromNow() : 'N/A',
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
      task: data.task,
    })
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
            {task.next_due_date
              ? `Due at ${moment(task.next_due_date).format('MM/DD/YYYY hh:mm A')}`
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
              onClick={() => goToTaskHistory(taskId)}
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
              onClick={() => goToTaskEdit(taskId)}
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
