import { UpdateDueDate } from '@/api/tasks'
import { skipTask, deleteTask } from '@/store/tasksSlice'
import { Loading } from '@/Loading'
import { TASK_UPDATE_EVENT, Task } from '@/models/task'
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
import { Label } from '@/models/label'
import {
  bucketIntoDueDateGroup,
  bucketIntoLabelGroups,
  DueDateGroups,
  getDefaultExpandedState,
  GROUP_BY,
  groupTasksBy,
  LabelGroups,
  TaskGroups,
} from '@/utils/grouping'
import { retrieveValue, storeValue } from '@/utils/storage'
import { ConfirmationModal } from '../Modals/Inputs/ConfirmationModal'
import { DateModal } from '../Modals/Inputs/DateModal'
import { addDays, addWeeks, endOfDay, endOfWeek } from 'date-fns'
import WebSocketManager from '@/utils/websocket'
import { AppDispatch, RootState } from '@/store/store'
import { connect } from 'react-redux'
import { TaskUI, MakeTaskUI, MarshallDate } from '@/utils/marshalling'

type MyTasksProps = {
  userLabels: Label[]
  tasks: TaskUI[]
  deleteTask: (taskId: string) => Promise<any>
  skipTask: (taskId: string) => Promise<any>
} & WithNavigate

interface MyTasksState {
  isSnackbarOpen: boolean
  isMoreMenuOpen: boolean
  snackBarMessage: string | null
  groupBy: GROUP_BY
  groups: TaskGroups | null
  isExpanded: Record<keyof TaskGroups, boolean>
  isLoading: boolean
  contextMenuTask: TaskUI | null
}

class MyTasksImpl extends React.Component<MyTasksProps, MyTasksState> {
  private menuRef = React.createRef<HTMLDivElement>()
  private menuAnchorRef: HTMLDivElement
  private confirmationModalRef = React.createRef<ConfirmationModal>()
  private dateModalRef = React.createRef<DateModal>()

  private ws: WebSocketManager

  constructor(props: MyTasksProps) {
    super(props)

    this.ws = WebSocketManager.getInstance()

    this.menuAnchorRef = document.createElement('div')
    this.menuAnchorRef.style.position = 'absolute'
    this.setMenuAnchorPos(0, 0)

    document.body.appendChild(this.menuAnchorRef)

    const groupBy: GROUP_BY = retrieveValue<GROUP_BY>('group_by', 'due_date')
    const isExpanded = retrieveValue<Record<keyof TaskGroups, boolean>>(
      'expanded_groups',
      getDefaultExpandedState(groupBy, []),
    )

    this.state = {
      isSnackbarOpen: false,
      isMoreMenuOpen: false,
      snackBarMessage: null,
      groupBy,
      groups: null,
      isExpanded,
      isLoading: true,
      contextMenuTask: null,
    }
  }

  private loadTasks = async () => {
    const { userLabels, tasks } = this.props

    const { groupBy } = this.state
    const defaultExpanded = getDefaultExpandedState(groupBy, userLabels)
    const isExpanded = {
      ...defaultExpanded,
      ...retrieveValue<Record<keyof TaskGroups, boolean>>(
        'expanded_groups',
        defaultExpanded,
      ),
    }

    this.setState({
      groups: groupTasksBy(tasks, userLabels, groupBy),
      isExpanded,
      isLoading: false,
    })
  }

  private addTask = async (task: TaskUI) => {
    const { groups, groupBy } = this.state

    if (!groups) {
      throw new Error('Groups not loaded')
    }

    const now = new Date().getTime()
    const endOfToday = endOfDay(new Date()).getTime()
    const endOfTomorrow = endOfDay(addDays(new Date(), 1)).getTime()
    const endOfThisWeek = endOfWeek(new Date(), { weekStartsOn: 1 }).getTime()
    const endOfNextWeek = endOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 }).getTime()

    if (groupBy === 'due_date') {
      bucketIntoDueDateGroup(
        task,
        groups as DueDateGroups,
        now,
        endOfToday,
        endOfTomorrow,
        endOfThisWeek,
        endOfNextWeek,
      )
    } else if (groupBy === 'labels') {
      bucketIntoLabelGroups(task, groups as LabelGroups)
    }

    this.setState({
      groups,
    })
  }

  private onTaskUpdated = async (
    oldTask: TaskUI,
    newTask: TaskUI,
    event: TASK_UPDATE_EVENT,
  ) => {
    this.removeTask(oldTask.id)

    if (newTask.next_due_date != null) {
      this.addTask(newTask)
    }

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

  private removeTask = async (taskId: string) => {
    const { groups } = this.state

    if (!groups) {
      throw new Error('Groups not loaded')
    }

    for (const groupKey in groups) {
      const group = groupKey as keyof TaskGroups
      groups[group].content = groups[group].content.filter(t => t.id !== taskId)
    }

    this.setState({
      groups,
    })
  }

  componentDidMount(): void {
    this.loadTasks()
    // this.registerWebSocketListeners()

    setTitle('My Tasks')

    document.addEventListener('click', this.dismissMoreMenu)
  }

  componentWillUnmount(): void {
    document.removeEventListener('click', this.dismissMoreMenu)

    // this.unregisterWebSocketListeners()
  }

  // private registerWebSocketListeners = () => {
  //   this.ws.on('task_created', this.onTaskCreatedWS);
  //   this.ws.on('task_updated', this.onTaskUpdatedWS);
  //   this.ws.on('task_deleted', this.onTaskDeletedWS);
  //   this.ws.on('task_completed', this.onTaskCompletedWS);
  //   this.ws.on('task_uncompleted', this.onTaskUncompletedWS);
  //   this.ws.on('task_skipped', this.onTaskSkippedWS);
  // }

  // private unregisterWebSocketListeners = () => {
  //   this.ws.off('task_created', this.onTaskCreatedWS);
  //   this.ws.off('task_updated', this.onTaskUpdatedWS);
  //   this.ws.off('task_deleted', this.onTaskDeletedWS);
  //   this.ws.off('task_completed', this.onTaskCompletedWS);
  //   this.ws.off('task_uncompleted', this.onTaskUncompletedWS);
  //   this.ws.off('task_skipped', this.onTaskSkippedWS);
  // }

  // private onTaskCreatedWS = (data: unknown) => {
  //   const newTask = UnmarshallTask(data as MarshalledTask)
  //   this.addTask(newTask)
  //   store.dispatch(taskUpserted(newTask))
  // }

  // private onTaskUpdatedWS = (data: unknown) => {
  //   const updatedTask = UnmarshallTask(data as MarshalledTask)
  //   this.onTaskUpdated(updatedTask, updatedTask, 'updated')
  //   store.dispatch(taskUpserted(updatedTask))
  // }

  // private onTaskDeletedWS = (data: unknown) => {
  //   const deletedTaskId = (data as any).id as string
  //   this.removeTask(deletedTaskId)
  //   store.dispatch(taskDeleted(deletedTaskId))
  // }

  // private onTaskCompletedWS = (data: unknown) => {
  //   const completedTask = UnmarshallTask(data as MarshalledTask)
  //   this.onTaskUpdated(completedTask, completedTask, 'completed')
  //   store.dispatch(taskUpserted(completedTask))
  // }

  // private onTaskUncompletedWS = (data: unknown) => {
  //   const uncompletedTask = UnmarshallTask(data as MarshalledTask)
  //   this.onTaskUpdated(uncompletedTask, uncompletedTask, 'updated')
  //   store.dispatch(taskUpserted(uncompletedTask))
  // }

  // private onTaskSkippedWS = (data: unknown) => {
  //   const skippedTask = UnmarshallTask(data as MarshalledTask)
  //   this.onTaskUpdated(skippedTask, skippedTask, 'skipped')
  //   store.dispatch(taskUpserted(skippedTask))
  // }

  private onSnackbarClosed = () => {
    this.setState({
      isSnackbarOpen: false,
    })
  }

  private onToggleGroupClicked = (groupKey: keyof TaskGroups) => {
    const { isExpanded } = this.state
    const nextExpanded = {
      ...isExpanded,
      [groupKey]: !isExpanded[groupKey],
    }

    this.setState({
      isExpanded: nextExpanded,
    })

    storeValue('expanded_groups', nextExpanded)
  }

  private onToggleGroupByClicked = () => {
    const { userLabels, tasks } = this.props
    const { groupBy } = this.state
    const nextGroupBy = groupBy === 'due_date' ? 'labels' : 'due_date'
    const nextExpanded = getDefaultExpandedState(nextGroupBy, userLabels)

    this.setState({
      groupBy: nextGroupBy,
      groups: groupTasksBy(tasks, userLabels, nextGroupBy),
      isExpanded: nextExpanded,
    })

    storeValue('group_by', nextGroupBy)
    storeValue('expanded_groups', nextExpanded)
  }

  private hasTasks = () => {
    const { groups } = this.state

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

    const response = await this.props.skipTask(task.id)
    const taskUI = MakeTaskUI(response.payload as Task, this.props.userLabels)

    this.dismissMoreMenu()
    this.onTaskUpdated(task, taskUI, 'skipped')
  }

  private onChangeDueDateClicked = () => {
    const { contextMenuTask: task } = this.state
    if (task === null) {
      throw new Error('Attempted to change due date without task reference')
    }

    this.dismissMoreMenu()
    this.dateModalRef.current?.open(task.next_due_date)
  }

  private onDeleteClicked = () => {
    this.dismissMoreMenu()
    this.confirmationModalRef.current?.open()
  }

  private onDeleteConfirmed = async (isConfirmed: boolean) => {
    const { contextMenuTask: task } = this.state

    if (task === null) {
      throw new Error('Attempted to delete without task reference')
    }

    if (isConfirmed === true) {
      await this.props.deleteTask(task.id)

      this.removeTask(task.id)
    }
  }

  private onDueDateModalClosed = async (newDate: Date | null) => {
    if (newDate === null) {
      return
    }

    const { contextMenuTask: task } = this.state
    if (task === null) {
      throw new Error('Attempted to delete without task reference')
    }

    const response = await UpdateDueDate(task.id, MarshallDate(newDate))
    const newTaskUI = MakeTaskUI(response.task, this.props.userLabels)

    this.onTaskUpdated(task, newTaskUI, 'rescheduled')
  }

  render(): React.ReactNode {
    const { isSnackbarOpen, isMoreMenuOpen, snackBarMessage, isLoading, groups, groupBy, contextMenuTask } =
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
              const groupKey = key as keyof TaskGroups
              const group = groups[groupKey]
              if (group.content.length === 0) {
                return null
              }

              const isExpanded = this.state.isExpanded[groupKey]
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
                        onTaskUpdate={(updatedTask, event) =>
                          this.onTaskUpdated(task, updatedTask, event)
                        }
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
  const userLabels = state.labels.items

  return {
    userLabels,
    tasks: state.tasks.items.map(task => MakeTaskUI(task, userLabels)),
  }
}

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  deleteTask: (taskId: string) => dispatch(deleteTask(taskId)),
  skipTask: (taskId: string) => dispatch(skipTask(taskId)),
})

export const MyTasks = connect(
  mapStateToProps,
  mapDispatchToProps,
)(MyTasksImpl)
