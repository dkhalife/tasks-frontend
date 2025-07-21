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
import { ConfirmationModal } from '../Modals/Inputs/ConfirmationModal'
import { moveFocusToJoyInput } from '@/utils/joy'
import { playSound, SoundEffect } from '@/utils/sound'
import { AppDispatch, RootState } from '@/store/store'
import { connect } from 'react-redux'
import { Label } from '@/models/label'
import { sortTasksByDueDate } from '@/utils/grouping'
import { TaskUI, MakeTaskUI, MarshallDate } from '@/utils/marshalling'

type TasksOverviewProps = {
  tasks: TaskUI[]
  userLabels: Label[]

  search: string
  filterTasks: (searchQuery: string) => void
  completeTask: (taskId: number) => Promise<any>
  deleteTask: (taskId: number) => Promise<any>
  updateDueDate: (taskId: number, dueDate: string) => Promise<any>
} & WithNavigate

class TasksOverviewImpl extends React.Component<TasksOverviewProps> {
  private dateModalRef = React.createRef<DateModal>()
  private confirmationModalRef = React.createRef<ConfirmationModal>()
  private searchInputRef = React.createRef<HTMLInputElement>()

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

  private onCompleteTaskClicked = (task: TaskUI) => async () => {
    await this.props.completeTask(task.id)

    playSound(SoundEffect.TaskComplete)
  }

  private onSearchTermsChanged = (e: ChangeEvent<HTMLInputElement>) => {
    this.props.filterTasks(e.target.value)
  }

  private onClearSearchClicked = () => {
    this.props.filterTasks('')
  }

  private onRescheduleClicked = async (task: TaskUI) => {
    this.dateModalRef.current?.open(task.next_due_date, (newDate: Date | null) => {
      if (newDate === null) {
        return
      }

      this.props.updateDueDate(task.id, MarshallDate(newDate))
    })
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
    this.confirmationModalRef.current?.open(async () => {
      await this.props.deleteTask(task.id)
    })
  }

  render(): React.ReactNode {
    const { search, tasks, navigate } = this.props

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
          title={`Change due date`}
        />
        <ConfirmationModal
          ref={this.confirmationModalRef}
          title='Delete Task'
          confirmText='Delete'
          cancelText='Cancel'
          message='Are you sure you want to delete this task?'
        />
      </Container>
    )
  }
}

const mapStateToProps = (state: RootState) => {
  const userLabels = state.labels.items
  const search = state.tasks.searchQuery
  const tasks = sortTasksByDueDate(state.tasks.filteredItems.map(task => MakeTaskUI(task, userLabels)))

  return {
    userLabels,
    search,
    tasks,
  }
}

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  filterTasks: (searchQuery: string) => dispatch(filterTasks(searchQuery)),
  completeTask: (taskId: number) => dispatch(completeTask(taskId)),
  deleteTask: (taskId: number) => dispatch(deleteTask(taskId)),
  updateDueDate: (taskId: number, dueDate: string) =>
    dispatch(updateDueDate({ taskId, dueDate })),
})

export const TasksOverview = connect(
  mapStateToProps,
  mapDispatchToProps,
)(TasksOverviewImpl)
