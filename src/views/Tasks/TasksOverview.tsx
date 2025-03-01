import { GetTasks, MarkTaskComplete, UpdateDueDate } from '@/api/tasks'
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
  ButtonGroup,
  IconButton,
} from '@mui/joy'
import React, { ChangeEvent } from 'react'
import { DateModal } from '@/views/Modals/Inputs/DateModal'
import { NavigationPaths, WithNavigate } from '@/utils/navigation'
import { setTitle } from '@/utils/dom'
import { getTextColorFromBackgroundColor } from '@/utils/Colors'
import { sortTasksByDueDate } from '@/utils/tasks'
import { Loading } from '@/Loading'

type TasksOverviewProps = object & WithNavigate

interface TasksOverviewState {
  tasks: Task[]
  filteredTasks: Task[]
  search: string
  taskId: string | null
  isLoading: boolean
}

export class TasksOverview extends React.Component<
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
      isLoading: true,
    }
  }

  private loadTasks = async () => {
    const data = await GetTasks()
    this.setState({
      tasks: data.tasks,
      filteredTasks: data.tasks,
      isLoading: false,
    })
  }

  componentDidMount(): void {
    this.loadTasks()

    setTitle('Tasks Overview')
  }

  private handleChangeDueDate = async (date: Date | null) => {
    if (!date) {
      return
    }

    const { tasks, taskId } = this.state
    if (!taskId) {
      return
    }

    const data = await UpdateDueDate(taskId, date)
    const newTask = data.task
    let newTasks = [...tasks]

    const index = newTasks.findIndex(c => c.id === newTask.id)
    newTasks[index] = newTask

    newTasks = sortTasksByDueDate(newTasks)

    this.setState({
      tasks: newTasks,
      filteredTasks: newTasks,
    })
  }

  private onCompleteTask = (task: Task) => async () => {
    const data = await MarkTaskComplete(task.id)
    const newTask = data.task

    const { tasks } = this.state
    let newTasks = tasks.filter(t => t.id !== task.id)

    if (newTask.next_due_date !== null) {
      newTasks.push(newTask)

      newTasks = sortTasksByDueDate(newTasks)
    }

    const index = newTasks.findIndex(
      c => c.id === task.id,
    )
    newTasks[index] = newTask

    this.setState({
      tasks: newTasks,
      filteredTasks: newTasks,
    })
  }

  private onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { tasks } = this.state
    const newTasks = tasks.filter(task => {
      return task.title.includes(e.target.value)
    })

    const newState = {
      search: e.target.value,
      filteredTasks: e.target.value === '' ? tasks : newTasks,
    }
    this.setState(newState)
  }

  private onClearSearch = () => {
    const { tasks } = this.state
    this.setState({ search: '', filteredTasks: tasks })
  }

  private onReschedule = async (task: Task) => {
    await this.setState({
      taskId: task.id,
    })
    this.dateModalRef.current?.open()
  }

  render(): React.ReactNode {
    const { filteredTasks, search, taskId, isLoading } = this.state
    const { navigate } = this.props

    if (isLoading) {
      return <Loading />
    }

    return (
      <Container>
        <Typography
          level='h4'
          mb={1.5}
        >
          Tasks Overview
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
              onChange={this.onSearchChange}
              endDecorator={
                search !== '' ? (
                  <Button
                    onClick={this.onClearSearch}
                  >
                    <CancelRounded />
                  </Button>
                ) : (
                  <Button>
                    <SearchRounded />
                  </Button>
                )
              }
            />
          </Grid>
          <Grid
            sm={6}
            justifyContent={'flex-end'}
            display={'flex'}
            gap={2}
          >
            <Button
              onClick={() => navigate(NavigationPaths.TaskCreate)}
            >
              New Task
            </Button>
          </Grid>
        </Grid>

        <Table>
          <thead>
            <tr>
              <th>Due</th>
              <th>Task</th>
              <th>Labels</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task: Task) => (
              <tr key={task.id}>
                <td>
                  <Chip color={getDueDateChipColor(task.next_due_date)}>
                    {getDueDateChipText(task.next_due_date)}
                  </Chip>
                </td>
                <td
                  style={{
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(NavigationPaths.TaskEdit(task.id))}
                >
                  {task.title || '--'}
                </td>
                <td>
                  {task.labels.map((l, index) => {
                    return (
                      <Chip
                        variant='solid'
                        key={`taskcard-${task.id}-label-${l.id}`}
                        color='primary'
                        sx={{
                          position: 'relative',
                          ml: index === 0 ? 0 : 0.5,
                          top: 2,
                          zIndex: 1,
                          backgroundColor: `${l.color} !important`,
                          color: getTextColorFromBackgroundColor(l.color),
                        }}
                      >
                        {l?.name}
                      </Chip>
                    )
                  })}
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
                      onClick={() => this.onReschedule(task)}
                      aria-setsize={2}
                    >
                      <History />
                    </IconButton>
                    <IconButton
                      variant='outlined'
                      size='sm'
                      onClick={() => navigate(NavigationPaths.TaskEdit(task.id))}
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
          current={null}
          title={`Change due date`}
          onClose={this.handleChangeDueDate}
        />
      </Container>
    )
  }
}
