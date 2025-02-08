import { GetTasks, MarkTaskComplete } from '@/api/tasks'
import { withNavigation } from '@/contexts/hooks'
import { Task, getDueDateChipColor, getDueDateChipText } from '@/models/task'
import {
  CancelRounded,
  SearchRounded,
  CheckBox,
  Edit,
  History,
} from '@mui/icons-material'
import {
  Container,
  Typography,
  Grid,
  Input,
  Button,
  Table,
  Chip,
  Tooltip,
  ButtonGroup,
  IconButton,
} from '@mui/joy'
import moment from 'moment'
import React, { ChangeEvent } from 'react'
import { DateModal } from '@/views/Modals/Inputs/DateModal'

interface TasksOverviewProps {
  navigate: (path: string) => void
}

interface TasksOverviewState {
  tasks: Task[]
  filteredTasks: Task[]
  search: string
  taskId: string | null
}

class TasksOverviewInner extends React.Component<
  TasksOverviewProps,
  TasksOverviewState
> {
  private dateModalRef = React.createRef<DateModal>()

  constructor(props: TasksOverviewProps) {
    super(props)
    this.state = {
      tasks: [],
      filteredTasks: [],
      search: '',
      taskId: null,
    }
  }

  private loadTasks = async () => {
    const data = await GetTasks()
    this.setState({ tasks: data.tasks, filteredTasks: data.tasks })
  }

  componentDidMount(): void {
    this.loadTasks()
  }

  private onCloseDateModal = async (date: string | null) => {
    if (!date) {
      return
    }

    const { tasks, taskId } = this.state
    if (!taskId) {
      return
    }

    const data = await MarkTaskComplete(taskId, new Date(date))
    const newTask = data.task
    const newTasks = [...tasks]
    const index = newTasks.findIndex(c => c.id === newTask.id)
    newTasks[index] = newTask

    this.setState({
      tasks: newTasks,
      filteredTasks: newTasks,
    })
  }

  private onCompleteTask = (task: Task) => async () => {
    const data = await MarkTaskComplete(task.id, null)
    const newTask = data.task

    const { tasks } = this.state
    const newTasks = [...tasks]
    const index = newTasks.findIndex(
      c => c.id === task.id,
    )
    newTasks[index] = newTask

    this.setState({
      tasks: newTasks,
      filteredTasks: newTasks,
    })
  }

  render(): React.ReactNode {
    const { tasks, filteredTasks, search, taskId } = this.state

    return (
      <Container>
        <Typography
          level='h4'
          mb={1.5}
        >
          Tasks Overviews
        </Typography>

        <Grid container>
          <Grid
            sm={6}
            alignSelf={'flex-start'}
            minWidth={100}
            display='flex'
            gap={2}
          >
            <Input
              placeholder='Search'
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const newTasks = tasks.filter(task => {
                  return task.title.includes(e.target.value)
                })

                const newState = {
                  search: e.target.value,
                  filteredTasks: e.target.value === '' ? tasks : newTasks,
                }
                this.setState(newState)
              }}
              endDecorator={
                search !== '' ? (
                  <Button
                    onClick={() => {
                      this.setState({ search: '', filteredTasks: tasks })
                    }}
                  >
                    <CancelRounded />
                  </Button>
                ) : (
                  <Button>
                    <SearchRounded />
                  </Button>
                )
              }
            ></Input>
          </Grid>
          <Grid
            sm={6}
            justifyContent={'flex-end'}
            display={'flex'}
            gap={2}
          >
            <Button
              onClick={() => {
                this.props.navigate(`/tasks/create`)
              }}
            >
              New Task
            </Button>
          </Grid>
        </Grid>

        <Table>
          <thead>
            <tr>
              <th style={{ width: 100 }}>Due</th>
              <th>Task</th>
              <th>Due</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task: Task) => (
              <tr key={task.id}>
                <td>
                  <Chip color={getDueDateChipColor(task.nextDueDate)}>
                    {getDueDateChipText(task.nextDueDate)}
                  </Chip>
                </td>
                <td
                  onClick={() => {
                    this.props.navigate(`/tasks/${task.id}/edit`)
                  }}
                >
                  {task.title || '--'}
                </td>
                <td>
                  <Tooltip
                    title={
                      task.nextDueDate === null
                        ? 'no due date'
                        : moment(task.nextDueDate).format('YYYY-MM-DD')
                    }
                    size='sm'
                  >
                    <Typography>
                      {task.nextDueDate === null
                        ? '--'
                        : moment(task.nextDueDate).fromNow()}
                    </Typography>
                  </Tooltip>
                </td>

                <td>
                  <ButtonGroup>
                    <IconButton
                      variant='outlined'
                      size='sm'
                      onClick={this.onCompleteTask(task)}
                      aria-setsize={2}
                    >
                      <CheckBox />
                    </IconButton>
                    <IconButton
                      variant='outlined'
                      size='sm'
                      onClick={() => {
                        this.setState({
                          taskId: task.id,
                        })
                        this.dateModalRef.current?.open()
                      }}
                      aria-setsize={2}
                    >
                      <History />
                    </IconButton>
                    <IconButton
                      variant='outlined'
                      size='sm'
                      onClick={() => {
                        this.props.navigate(`/tasks/${task.id}/edit`)
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </ButtonGroup>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <DateModal
          ref={this.dateModalRef}
          key={taskId}
          current=''
          title={`Change due date`}
          onClose={this.onCloseDateModal}
        />
      </Container>
    )
  }
}

export const TasksOverview = withNavigation(TasksOverviewInner)
