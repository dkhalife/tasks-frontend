import { skipTask, deleteTask, updateDueDate, setGroupBy, toggleGroup, initGroups } from '@/store/tasksSlice'
import { Loading } from '@/Loading'
import { Task, TASK_UPDATE_EVENT } from '@/models/task'
import {
  ExpandCircleDown,
  Add,
  Label as LabelIcon,
  CalendarMonth,
  Delete,
  ManageSearch,
  Edit,
  MoreTime,
  SwitchAccessShortcut,
} from '@mui/icons-material'
import {
  Container,
  Box,
  AccordionGroup,
  Accordion,
  Divider,
  Chip,
  AccordionDetails,
  IconButton,
  Snackbar,
  Typography,
  MenuItem,
  Menu,
} from '@mui/joy'
import React from 'react'
import { TaskCard } from '@/views/Tasks/TaskCard'
import { setTitle } from '@/utils/dom'
import { NavigationPaths, WithNavigate } from '@/utils/navigation'
import {
  GROUP_BY,
  TaskGroups,
} from '@/utils/grouping'
import { ConfirmationModal } from '../Modals/Inputs/ConfirmationModal'
import { DateModal } from '../Modals/Inputs/DateModal'
import { AppDispatch, RootState } from '@/store/store'
import { connect } from 'react-redux'
import { TaskUI, MarshallDate, MakeTaskGroupsUI } from '@/utils/marshalling'

type MyTasksProps = {
  isLoading: boolean

  groupBy: GROUP_BY
  groups: TaskGroups<TaskUI>
  expandedGroups: Record<keyof TaskGroups<TaskUI>, boolean>

  initGroups: () => void
  setGroupBy: (groupBy: GROUP_BY) => void
  toggleGroup: (groupKey: keyof TaskGroups<Task>) => void

  deleteTask: (taskId: string) => Promise<any>
  skipTask: (taskId: string) => Promise<any>
  updateDueDate: (taskId: string, dueDate: string) => Promise<any>
} & WithNavigate

interface MyTasksState {
  isSnackbarOpen: boolean
  isMoreMenuOpen: boolean
  snackBarMessage: string | null

  contextMenuTask: TaskUI | null
}

class MyTasksImpl extends React.Component<MyTasksProps, MyTasksState> {
  private menuRef = React.createRef<HTMLDivElement>()
  private menuAnchorRef: HTMLDivElement
  private confirmationModalRef = React.createRef<ConfirmationModal>()
  private dateModalRef = React.createRef<DateModal>()

  constructor(props: MyTasksProps) {
    super(props)

    this.menuAnchorRef = document.createElement('div')
    this.menuAnchorRef.style.position = 'absolute'
    this.setMenuAnchorPos(0, 0)

    document.body.appendChild(this.menuAnchorRef)

    this.state = {
      isSnackbarOpen: false,
      isMoreMenuOpen: false,
      snackBarMessage: null,
      contextMenuTask: null,
    }
  }

  private onEvent = (event: TASK_UPDATE_EVENT) => {
    let message
    switch (event) {
      case 'completed':
        message = 'Task completed'
        break
      case 'rescheduled':
        message = 'Task rescheduled'
        break
      case 'skipped':
        message = 'Task skipped'
        break

      default:
        return
    }

    this.setState({
      snackBarMessage: message,
      isSnackbarOpen: true,
    })
  }

  componentDidMount(): void {
    setTitle('My Tasks')

    this.props.initGroups()

    document.addEventListener('click', this.dismissMoreMenu)
  }

  componentWillUnmount(): void {
    document.removeEventListener('click', this.dismissMoreMenu)
  }

  private onSnackbarClosed = () => {
    this.setState({
      isSnackbarOpen: false,
    })
  }

  private onToggleGroupClicked = (groupKey: keyof TaskGroups<TaskUI>) => {
    this.props.toggleGroup(groupKey)
  }

  private onToggleGroupByClicked = () => {
    const nextGroupBy = this.props.groupBy === 'due_date' ? 'labels' : 'due_date'
    this.props.setGroupBy(nextGroupBy)
  }

  private hasTasks = () => {
    const { groups } = this.props

    if (!groups) {
      return true
    }

    return Object.values(groups).some(group => group.content.length > 0)
  }

  private setMenuAnchorPos = (x: number, y: number) => {
    this.menuAnchorRef.style.left = `${x}px`
    this.menuAnchorRef.style.top = `${y}px`
  }

  private showContextMenu = (event: React.MouseEvent, task: TaskUI) => {
    const { pageX, pageY } = event
    this.setMenuAnchorPos(pageX, pageY);

    event.preventDefault()
    event.stopPropagation()

    this.setState({
      isMoreMenuOpen: true,
      contextMenuTask: task,
    })
  }

  private dismissMoreMenu = () => {
    this.setState({
      isMoreMenuOpen: false,
      contextMenuTask: null,
    })
  }

  private onEditClicked = () =>{
    const { contextMenuTask: task } = this.state
    if (task === null) {
      throw new Error('Attempted to delete without task reference')
    }

    this.dismissMoreMenu()
    this.props.navigate(NavigationPaths.TaskEdit(task.id))
  }

  private onViewHistoryClicked = () => {
    const { contextMenuTask: task } = this.state
    if (task === null) {
      throw new Error('Attempted to view history without task reference')
    }

    this.dismissMoreMenu()
    this.props.navigate(NavigationPaths.TaskHistory(task.id))
  }

  private onSkipTaskClicked = async () => {
    const { contextMenuTask: task } = this.state
    if (task === null) {
      throw new Error('Attempted to skip a task without a reference')
    }

    await this.props.skipTask(task.id)

    this.dismissMoreMenu()
    this.onEvent('skipped')
  }

  private onChangeDueDateClicked = () => {
    const { contextMenuTask: task } = this.state
    if (task === null) {
      throw new Error('Attempted to change due date without task reference')
    }

    this.dismissMoreMenu()
    this.dateModalRef.current?.open(task.next_due_date, async (newDate: Date | null) => {
      if (newDate === null) {
        return
      }

      await this.props.updateDueDate(task.id, MarshallDate(newDate))

      this.onEvent('rescheduled')
    })
  }

  private onDeleteClicked = () => {
    const { contextMenuTask: task } = this.state
    if (task === null) {
      throw new Error('Attempted to delete a task without task reference')
    }

    this.dismissMoreMenu()
    this.confirmationModalRef.current?.open(async () => {
      await this.props.deleteTask(task.id)
    })
  }

  render(): React.ReactNode {
    const { groupBy, groups, expandedGroups, isLoading } = this.props
    const { isSnackbarOpen, isMoreMenuOpen, snackBarMessage, contextMenuTask } =
      this.state

    if (isLoading || groups === null) {
      return <Loading />
    }

    const { navigate } = this.props
    const hasTasks = this.hasTasks()

    return (
      <Container maxWidth='md'>
        <Box
          sx={{
            textAlign: 'right',
          }}
        >
          <Typography
            sx={{
              display: 'inline-block',
              fontWeight: 600,
              lineHeight: '25px',
              verticalAlign: 'top',
              mt: '5px',
              mr: 2,
            }}
          >
            Group by :
          </Typography>
          <Box
            sx={{
              display: 'inline-block',
            }}
          >
            <IconButton
              color='primary'
              variant='solid'
              sx={{
                borderRadius: '50%',
                width: '25px',
                height: '25px',
              }}
              onClick={this.onToggleGroupByClicked}
            >
              {groupBy === 'due_date' ? <CalendarMonth /> : <LabelIcon />}
            </IconButton>
          </Box>
        </Box>

        {hasTasks && (
          <AccordionGroup
            transition='0.2s ease'
            disableDivider
          >
            {Object.keys(groups).map(key => {
              const groupKey = key as keyof TaskGroups<TaskUI>
              const group = groups[groupKey]
              if (group.content.length === 0) {
                return null
              }

              const isExpanded = expandedGroups[groupKey]
              return (
                <Accordion
                  key={`group-${key}`}
                  title={group.name}
                  sx={{
                    my: 0,
                  }}
                  expanded={isExpanded}
                >
                  <Divider orientation='horizontal'>
                    <Chip
                      variant='soft'
                      color='neutral'
                      size='md'
                      onClick={() => this.onToggleGroupClicked(groupKey)}
                      endDecorator={
                        <ExpandCircleDown
                          color='primary'
                          sx={{
                            transform: isExpanded
                              ? 'rotate(180deg)'
                              : 'rotate(0deg)',
                          }}
                        />
                      }
                      startDecorator={
                        <Chip
                          color='primary'
                          size='sm'
                          variant='soft'
                        >
                          {group.content.length}
                        </Chip>
                      }
                    >
                      {group.name}
                    </Chip>
                  </Divider>
                  <AccordionDetails
                    sx={{
                      flexDirection: 'column',
                      my: 0,
                    }}
                  >
                    {group.content.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onTaskUpdate={this.onEvent}
                        onContextMenu={this.showContextMenu}
                        navigate={navigate}
                      />
                    ))}
                  </AccordionDetails>
                </Accordion>
              )
            })}
          </AccordionGroup>
        )}

        <Menu
          size='lg'
          anchorEl={this.menuAnchorRef}
          popperOptions={
            {
              placement: 'bottom-start',
            }
          }
          open={isMoreMenuOpen}
          ref={this.menuRef}
        >
          {contextMenuTask && contextMenuTask.frequency.type !== 'once' && (
            <MenuItem onClick={this.onSkipTaskClicked}>
              <SwitchAccessShortcut />
              Skip to next due date
            </MenuItem>
          )}
          <MenuItem onClick={this.onChangeDueDateClicked}>
            <MoreTime />
            Change due date
          </MenuItem>
          <MenuItem onClick={this.onEditClicked}>
            <Edit />
            Edit
          </MenuItem>
          <Divider />
          <MenuItem onClick={this.onViewHistoryClicked}>
            <ManageSearch />
            History
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={this.onDeleteClicked}
            color='danger'
          >
            <Delete />
            Delete
          </MenuItem>
        </Menu>

        {!hasTasks && (
          <Typography
            textAlign='center'
            mt={2}
          >
            No tasks available. Add one to get started.
          </Typography>
        )}

        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            right: 10,
            padding: 2,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
            'z-index': 1000,
          }}
        >
          <IconButton
            color='primary'
            variant='solid'
            sx={{
              borderRadius: '50%',
              width: 50,
              height: 50,
            }}
            onClick={() => navigate(NavigationPaths.TaskCreate)}
          >
            <Add />
          </IconButton>

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
        </Box>
        <Snackbar
          open={isSnackbarOpen}
          onClose={this.onSnackbarClosed}
          autoHideDuration={3000}
          variant='soft'
          color='success'
          size='lg'
          invertedColors
        >
          <Typography level='title-md'>{snackBarMessage}</Typography>
        </Snackbar>
      </Container>
    )
  }
}

const mapStateToProps = (state: RootState) => {
  const isLoading = state.tasks.status === 'loading' || state.labels.status === 'loading'
  const userLabels = state.labels.items

  return {
    isLoading,
    groupBy: state.tasks.groupBy,
    groups: MakeTaskGroupsUI(state.tasks.groupedItems, userLabels),
    expandedGroups: state.tasks.expandedGroups,
  }
}

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  initGroups: () => dispatch(initGroups()),
  setGroupBy: (groupBy: GROUP_BY) => dispatch(setGroupBy(groupBy)),
  toggleGroup: (groupKey: keyof TaskGroups<Task>) => dispatch(toggleGroup(groupKey)),

  deleteTask: (taskId: string) => dispatch(deleteTask(taskId)),
  skipTask: (taskId: string) => dispatch(skipTask(taskId)),
  updateDueDate: (taskId: string, dueDate: string) =>
    dispatch(updateDueDate({ taskId, dueDate })),
})

export const MyTasks = connect(
  mapStateToProps,
  mapDispatchToProps,
)(MyTasksImpl)
