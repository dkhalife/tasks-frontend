import { GetTasks } from '@/api/tasks'
import { Loading } from '@/Loading'
import { Task, TASK_UPDATE_EVENT } from '@/models/task'
import { ExpandCircleDown, Add, Label as LabelIcon, CalendarMonth } from '@mui/icons-material'
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
} from '@mui/joy'
import React from 'react'
import { TaskCard } from '@/views/Tasks/TaskCard'
import { TaskGroups, bucketIntoDueDateGroup, bucketIntoLabelGroups, groupTasksBy } from '@/utils/tasks'
import moment from 'moment'
import { setTitle } from '@/utils/dom'
import { NavigationPaths, WithNavigate } from '@/utils/navigation'
import { Label } from '@/models/label'
import { GetLabels } from '@/api/labels'
import { DueDateGroups, getDefaultExpandedState, GROUP_BY, LabelGroups } from '@/utils/grouping'
import { retrieveValue, storeValue } from '@/utils/storage'

type MyTasksProps = WithNavigate

interface MyTasksState {
  isSnackbarOpen: boolean
  snackBarMessage: string | null
  tasks: Task[]
  labels: Label[]
  groupBy: GROUP_BY
  groups: TaskGroups | null
  isExpanded: Record<keyof TaskGroups, boolean>
  isLoading: boolean
}

export class MyTasks extends React.Component<MyTasksProps, MyTasksState> {
  constructor(props: MyTasksProps) {
    super(props)

    const groupBy: GROUP_BY = retrieveValue<GROUP_BY>('group_by', 'due_date') 
    const isExpanded = retrieveValue<Record<keyof TaskGroups, boolean>>('expanded_groups', getDefaultExpandedState(groupBy, []))

    this.state = {
      isSnackbarOpen: false,
      snackBarMessage: null,
      tasks: [],
      labels: [],
      groupBy,
      groups: null,
      isExpanded,
      isLoading: true,
    }
  }

  private loadTasks = async () => {
    const tasksData = await GetTasks()
    const labelsData = await GetLabels()

    const tasks = tasksData.tasks
    const labels = labelsData.labels

    const { groupBy } = this.state
    const defaultExpanded = getDefaultExpandedState(groupBy, labels)
    const isExpanded = {
      ...defaultExpanded,
      ...retrieveValue<Record<keyof TaskGroups, boolean>>('expanded_groups', defaultExpanded),
    }

    this.setState({
      tasks,
      labels,
      groups: groupTasksBy(tasks, labels, groupBy),
      isExpanded,
      isLoading: false,
    })
  }

  private addTask = async (task: Task) => {
    const { groups, groupBy } = this.state

    if (!groups) {
      throw new Error('Groups not loaded')
    }

    const now = new Date().getTime()
    const endOfToday = moment().endOf('day').toDate().getTime()
    const endOfTomorrow = moment().endOf('day').add(1, 'day').toDate().getTime()
    const endOfThisWeek = moment().endOf('isoWeek').toDate().getTime()
    const endOfNextWeek = moment().endOf('isoWeek').add(1, 'week').toDate().getTime()

    if (groupBy === 'due_date') {
      bucketIntoDueDateGroup(task, groups as DueDateGroups, now, endOfToday, endOfTomorrow, endOfThisWeek, endOfNextWeek)
    } else if (groupBy === 'labels') {
      bucketIntoLabelGroups(task, groups as LabelGroups)
    }

    this.setState({
      groups,
    })
  }

  private updateTask = async (group: keyof TaskGroups, oldTask: Task, newTask: Task, event: TASK_UPDATE_EVENT) => {
    this.removeTask(group, oldTask)

    if (newTask.next_due_date != null) {
      this.addTask(newTask)
    }

    let message
    switch (event) {
      default:
      case 'completed':
        message = "Task completed"
        break
      case 'rescheduled':
        message = "Task rescheduled"
        break
      case 'skipped':
        message = "Task skipped"
        break
    }

    this.setState({
      snackBarMessage: message,
      isSnackbarOpen: true,
    })
  }

  private removeTask = async (group: keyof TaskGroups, task: Task) => {
    const { groups } = this.state

    if (!groups) {
      throw new Error('Groups not loaded')
    }

    groups[group].content = groups[group].content.filter(t => t.id !== task.id)
    this.setState({
      groups,
    })
  }

  componentDidMount(): void {
    this.loadTasks()

    setTitle('My Tasks')
  }

  private onSnackbarClose = () => {
    this.setState({
      isSnackbarOpen: false,
    })
  }

  private toggleGroup = (groupKey: keyof TaskGroups) => {
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

  private toggleGroupBy = () => {
    const { groupBy, tasks, labels } = this.state
    const nextGroupBy = groupBy === 'due_date' ? 'labels' : 'due_date'
    const nextExpanded = getDefaultExpandedState(nextGroupBy, labels)

    this.setState({
      groupBy: nextGroupBy,
      groups: groupTasksBy(tasks, labels, nextGroupBy),
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

  render(): React.ReactNode {
    const { isSnackbarOpen, snackBarMessage, isLoading, groups, groupBy } = this.state

    if (isLoading || groups === null) {
      return <Loading />
    }

    const { navigate } = this.props
    const hasTasks = this.hasTasks()

    return (
      <Container maxWidth='md'>
        <Box sx={{
          textAlign: 'right',
        }}>
          <Typography sx={{
            display: 'inline-block',
            fontWeight: 600,
            lineHeight: '25px',
            verticalAlign: 'top',
            mt: '5px',
            mr: 2,
          }}>
            Group by :
          </Typography>
          <Box sx={{
            display: 'inline-block',
          }}>
            <IconButton
              color='primary'
              variant='solid'
              sx={{
                borderRadius: '50%',
                width: '25px',
                height: '25px',
              }}
              onClick={this.toggleGroupBy}
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
            {Object.keys(groups).map((key) => {
              const groupKey = key as keyof(TaskGroups)
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
                      onClick={() => this.toggleGroup(groupKey)}
                      endDecorator={
                        <ExpandCircleDown
                          color='primary'
                          sx={{
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}
                        />
                      }
                      startDecorator={
                        <Chip
                          color='primary'
                          size='sm'
                          variant='soft'
                        >
                          { group.content.length }
                        </Chip>
                      }
                    >
                      { group.name }
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
                        onTaskUpdate={(updatedTask, event) => this.updateTask(groupKey, task, updatedTask, event)}
                        onTaskRemove={() => this.removeTask(groupKey, task)}
                        viewOnly={false}
                        navigate={navigate}
                      />
                    ))}
                  </AccordionDetails>
                </Accordion>
              )
            })}
          </AccordionGroup>
        )}

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
        </Box>
        <Snackbar
          open={isSnackbarOpen}
          onClose={this.onSnackbarClose}
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
