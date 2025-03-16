import {
  DeleteTask,
  GetTasks,
  MarkTaskComplete,
  UpdateDueDate,
} from '@/api/tasks'
import { Task, getDueDateChipColor, getDueDateChipText } from '@/models/task'
import {
  CancelRounded,
  SearchRounded,
  CheckBox,
  Edit,
  History,
  CalendarMonth,
  Delete,
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
import { getTextColorFromBackgroundColor } from '@/utils/colors'
import { sortTasksByDueDate } from '@/utils/tasks'
import { Loading } from '@/Loading'
import { ConfirmationModal } from '../Modals/Inputs/ConfirmationModal'
import { moveFocusToJoyInput } from '@/utils/joy'

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
  private confirmationModalRef = React.createRef<ConfirmationModal>()
  private searchInputRef = React.createRef<HTMLInputElement>()
  private taskBeingDeleted: Task | null = null

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
    this.registerKeyboardShortcuts()
  }

  componentWillUnmount(): void {
    this.unregisterKeyboardShortcuts()
  }

  private registerKeyboardShortcuts = () => {
    document.addEventListener('keydown', this.onKeyDown)
  }

  private unregisterKeyboardShortcuts = () => {
    document.removeEventListener('keydown', this.onKeyDown)
  }

  private onKeyDown = (event: KeyboardEvent) => {
    // Ctrl + F => Search
    if (event.key === 'f' && event.ctrlKey) {
      moveFocusToJoyInput(this.searchInputRef)
      event.preventDefault()
    }

    if (
      event.key === '+' &&
      document.activeElement?.tagName.toLowerCase() !== 'input'
    ) {
      this.onAddTask()
      event.preventDefault()
      event.stopPropagation()
    }
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

    const index = newTasks.findIndex(c => c.id === task.id)
    newTasks[index] = newTask

    this.setState({
      tasks: newTasks,
      filteredTasks: newTasks,
    })
  }

  private onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { tasks } = this.state
    const newTasks = tasks.filter(task => {
      return task.title.toLowerCase().includes(e.target.value.toLowerCase())
    })

    const newState = {
      search: e.target.value,
      filteredTasks: e.target.value === '' ? tasks : newTasks,
    }
    this.setState(newState)
  }

  private onClearSearch = () => {
    const { tasks } = this.state
    this.setState({
      search: '',
      filteredTasks: tasks,
    })
  }

  private onReschedule = async (task: Task) => {
    await this.setState({
      taskId: task.id,
    })
    this.dateModalRef.current?.open(task.next_due_date)
  }

  private onViewHistory = (task: Task) => {
    const { navigate } = this.props
    navigate(NavigationPaths.TaskHistory(task.id))
  }

  private onAddTask = () => {
    const { navigate } = this.props
    navigate(NavigationPaths.TaskCreate)
  }

  private onDeleteTask = async (task: Task) => {
    this.taskBeingDeleted = task
    this.confirmationModalRef.current?.open()
  }

  private onDeleteConfirm = async (isConfirmed: boolean) => {
    const task = this.taskBeingDeleted
    this.taskBeingDeleted = null

    if (!isConfirmed) {
      return
    }

    const { tasks } = this.state
    if (!task) {
      throw new Error('Task to delete is not set')
    }

    await DeleteTask(task.id)
    const newTasks = tasks.filter(t => t.id !== task.id)

    this.setState({
      tasks: newTasks,
      filteredTasks: newTasks,
    })
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
              ref={this.searchInputRef}
              placeholder='Search'
              value={search}
              onChange={this.onSearchChange}
              endDecorator={
                search !== '' ? (
                  <Button onClick={this.onClearSearch}>
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
            <Button onClick={this.onAddTask}>New Task</Button>
          </Grid>
        </Grid>

        <Table>
          <thead>
            <tr>
              <th>Due</th>
              <th>Title</th>
              <th>Labels</th>
              <th>Actions</th>
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
                      <CalendarMonth />
                    </IconButton>
                    <IconButton
                      variant='outlined'
                      size='sm'
                      onClick={() => this.onViewHistory(task)}
                      aria-setsize={2}
                    >
                      <History />
                    </IconButton>
                    <IconButton
                      variant='outlined'
                      size='sm'
                      onClick={() =>
                        navigate(NavigationPaths.TaskEdit(task.id))
                      }
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      variant='outlined'
                      size='sm'
                      onClick={() => this.onDeleteTask(task)}
                      aria-setsize={2}
                    >
                      <Delete />
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
          title={`Change due date`}
          onClose={this.handleChangeDueDate}
        />
        <ConfirmationModal
          ref={this.confirmationModalRef}
          title='Delete Task'
          confirmText='Delete'
          cancelText='Cancel'
          message='Are you sure you want to delete this task?'
          onClose={this.onDeleteConfirm}
        />
      </Container>
    )
  }
}
