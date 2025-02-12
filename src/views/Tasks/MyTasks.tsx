import { GetTasks } from '@/api/tasks'
import { Loading } from '@/Loading'
import { Task } from '@/models/task'
import { ExpandCircleDown, Add } from '@mui/icons-material'
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
import { goToTaskCreate } from '@/utils/navigation'
import { TaskCard } from '@/views/Tasks/TaskCard'
import { groupTasksBy, TaskGroups } from '@/utils/Tasks'

type MyTasksProps = object

interface MyTasksState {
  isSnackbarOpen: boolean
  snackBarMessage: string | null
  tasks: Task[]
  groups: TaskGroups | null
  isExpanded: Record<keyof TaskGroups, boolean>
  isLoading: boolean
}

export class MyTasks extends React.Component<MyTasksProps, MyTasksState> {
  constructor(props: MyTasksProps) {
    super(props)

    this.state = {
      isSnackbarOpen: false,
      snackBarMessage: null,
      tasks: [],
      groups: null,
      isExpanded: {
        overdue: true,
        today: true,
        this_week: false,
        next_week: false,
        later: false,
        any_time: false,
      },
      isLoading: true,
    }
  }

  private loadTasks = async () => {
    const data = await GetTasks()
    this.setState({
      tasks: data.tasks,
      groups: groupTasksBy(data.tasks, 'due_date'),
      isLoading: false,
    })
  }

  componentDidMount(): void {
    this.loadTasks()
  }

  private onSnackbarClose = () => {
    this.setState({ isSnackbarOpen: false })
  }

  private toggleGroup = (groupKey: keyof TaskGroups) => {
    const { isExpanded } = this.state

    this.setState({
      isExpanded: {
        ...isExpanded,
        [groupKey]: !isExpanded[groupKey],
      },
    })
  }

  render(): React.ReactNode {
    const { isSnackbarOpen, snackBarMessage, isLoading, groups } = this.state

    if (isLoading || groups === null) {
      return <Loading />
    }

    return (
      <Container maxWidth='md'>
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
                      onTaskUpdate={() => {} /* TODO: update */}
                      onTaskRemove={() => {} /* TODO: update */}
                      sx={{}}
                      viewOnly={false}
                    />
                  ))}
                </AccordionDetails>
              </Accordion>
            )
          })}
        </AccordionGroup>
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 10,
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
            onClick={goToTaskCreate}
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
