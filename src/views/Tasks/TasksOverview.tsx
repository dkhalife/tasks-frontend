import { deleteTask, completeTask, updateDueDate, filterTasks } from '@/store/tasksSlice'
import { getDueDateChipColor, getDueDateChipText } from '@/models/task'
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
import { Loading } from '@/Loading'
import { ConfirmationModal } from '../Modals/Inputs/ConfirmationModal'
import { moveFocusToJoyInput } from '@/utils/joy'
import { playSound, SoundEffect } from '@/utils/sound'
import { AppDispatch, RootState } from '@/store/store'
import { connect } from 'react-redux'
import { Label } from '@/models/label'
import { sortTasksByDueDate } from '@/utils/grouping'
import { TaskUI, MarshallDate, MakeTaskUI } from '@/utils/marshalling'

type TasksOverviewProps = {
  tasks: TaskUI[]
  isLoading: boolean
  userLabels: Label[]

  search: string
  filterTasks: (searchQuery: string) => void
  completeTask: (taskId: string) => Promise<any>
  deleteTask: (taskId: string) => Promise<any>
  updateDueDate: (taskId: string, dueDate: string) => Promise<any>
} & WithNavigate

interface TasksOverviewState {
  taskId: string | null
}

class TasksOverviewImpl extends React.Component<
  TasksOverviewProps,
  TasksOverviewState
> {
  private dateModalRef = React.createRef<DateModal>()
  private confirmationModalRef = React.createRef<ConfirmationModal>()
  private searchInputRef = React.createRef<HTMLInputElement>()
  private taskBeingDeleted: TaskUI | null = null

  constructor(props: TasksOverviewProps) {
    super(props)

    this.state = {
      taskId: null
    }
  }

  componentDidMount(): void {
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
      this.onAddTaskClicked()
      event.preventDefault()
      event.stopPropagation()
    }
  }

  private onDueDateModalClosed = async (date: Date | null) => {
    if (!date) {
      return
    }

    const { tasks } = this.props
    const { taskId } = this.state
    if (!taskId) {
      return
    }

    const { userLabels } = this.props
    const data = await this.props.updateDueDate(
      taskId,
      MarshallDate(date),
    )
    const newTaskUI = MakeTaskUI(data.task, userLabels)

    let newTasks = [...tasks]

    const index = newTasks.findIndex(c => c.id === newTaskUI.id)
    newTasks[index] = newTaskUI

    newTasks = sortTasksByDueDate(newTasks)
  }

  private onCompleteTaskClicked = (task: TaskUI) => async () => {
    const data = await this.props.completeTask(task.id)

    const newTask = data.payload
    this.onTaskCompleted(newTask)

    playSound(SoundEffect.TaskComplete)
  }

  private onTaskCompleted = (task: TaskUI) => {
    const { tasks } = this.props
    let newTasks = tasks.filter(t => t.id !== task.id)

    if (task.next_due_date !== null) {
      newTasks.push(task)

      newTasks = sortTasksByDueDate(newTasks)
    }

    const index = newTasks.findIndex(c => c.id === task.id)
    newTasks[index] = task
  }

  private onSearchTermsChanged = (e: ChangeEvent<HTMLInputElement>) => {
    this.props.filterTasks(e.target.value)
  }

  private onClearSearchClicked = () => {
    this.props.filterTasks('')
  }

  private onRescheduleClicked = async (task: TaskUI) => {
    await this.setState({
      taskId: task.id,
    })
    this.dateModalRef.current?.open(task.next_due_date)
  }

  private onViewHistoryClicked = (task: TaskUI) => {
    const { navigate } = this.props
    navigate(NavigationPaths.TaskHistory(task.id))
  }

  private onAddTaskClicked = () => {
    const { navigate } = this.props
    navigate(NavigationPaths.TaskCreate)
  }

  private onDeleteTaskClicked = async (task: TaskUI) => {
    this.taskBeingDeleted = task
    this.confirmationModalRef.current?.open()
  }

  private onDeleteConfirmed = async (isConfirmed: boolean) => {
    const task = this.taskBeingDeleted
    this.taskBeingDeleted = null

    if (!isConfirmed) {
      return
    }

    if (!task) {
      throw new Error('Task to delete is not set')
    }

    await this.props.deleteTask(task.id)
  }

  render(): React.ReactNode {
    const { taskId } = this.state
    const { isLoading, search, tasks, navigate } = this.props

    if (isLoading) {
      return <Loading />
    }

    return (
      <Container>
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
              onChange={this.onSearchTermsChanged}
              endDecorator={
                search !== '' ? (
                  <Button onClick={this.onClearSearchClicked}>
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
            <Button onClick={this.onAddTaskClicked}>New Task</Button>
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
            {tasks.map((task: TaskUI) => (
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
                      onClick={this.onCompleteTaskClicked(task)}
                      aria-setsize={2}
                    >
                      <CheckBox />
                    </IconButton>
                    <IconButton
                      variant='outlined'
                      size='sm'
                      onClick={() => this.onRescheduleClicked(task)}
                      aria-setsize={2}
                    >
                      <CalendarMonth />
                    </IconButton>
                    <IconButton
                      variant='outlined'
                      size='sm'
                      onClick={() => this.onViewHistoryClicked(task)}
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
                      onClick={() => this.onDeleteTaskClicked(task)}
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
          onClose={this.onDueDateModalClosed}
        />
        <ConfirmationModal
          ref={this.confirmationModalRef}
          title='Delete Task'
          confirmText='Delete'
          cancelText='Cancel'
          message='Are you sure you want to delete this task?'
          onClose={this.onDeleteConfirmed}
        />
      </Container>
    )
  }
}

const mapStateToProps = (state: RootState) => {
  const userLabels = state.labels.items

  return {
    userLabels,
    isLoading: state.tasks.status === 'loading' || state.labels.status === 'loading',
    search: state.tasks.searchQuery,
    tasks: state.tasks.filteredItems.map(task => MakeTaskUI(task, userLabels)),
  }
}

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  filterTasks: (searchQuery: string) => dispatch(filterTasks(searchQuery)),
  completeTask: (taskId: string) => dispatch(completeTask(taskId)),
  deleteTask: (taskId: string) => dispatch(deleteTask(taskId)),
  updateDueDate: (taskId: string, dueDate: string) =>
    dispatch(updateDueDate({ taskId, dueDate })),
})

export const TasksOverview = connect(
  mapStateToProps,
  mapDispatchToProps,
)(TasksOverviewImpl)
