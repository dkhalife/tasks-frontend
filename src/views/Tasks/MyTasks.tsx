import { GetTasks } from "@/api/tasks"
import { GetUserProfile } from "@/api/users"
import { withNavigation } from "@/contexts/hooks"
import { Loading } from "@/Loading"
import { Task, TaskGroup } from "@/models/task"
import { User } from "@/models/user"
import { TasksGrouper } from "@/utils/Tasks"
import { ExpandCircleDown, Add } from "@mui/icons-material"
import { Container, Box, AccordionGroup, Accordion, Divider, Chip, AccordionDetails, IconButton, Snackbar, Typography } from "@mui/joy"
import React from "react"
import { IconButtonWithMenu } from "./IconButtonWithMenu"
import { TaskCard } from "./TaskCard"

interface MyTasksProps {
  navigate: (path: string) => void
}

interface MyTasksState {
  isSnackbarOpen: boolean
  snackBarMessage: string | null
  tasks: Task[]
  archivedTasks: Task[]
  filteredTasks: Task[]
  selectedFilter: string
  taskSections: TaskGroup[]
  selectedTaskSection: string
  userProfile: User | null
  isLoading: boolean
}

class MyTasksInner extends React.Component<MyTasksProps, MyTasksState> {
  constructor(props: MyTasksProps) {
    super(props)

    this.state = {
      isSnackbarOpen: false,
      snackBarMessage: null,
      tasks: [],
      archivedTasks: [],
      filteredTasks: [],
      selectedFilter: 'All',
      taskSections: [],
      selectedTaskSection: 'due_date',
      userProfile: null,
      isLoading: true,
    }
  }

  componentDidMount(): void {
    Promise.all([GetTasks(), GetUserProfile()]).then(responses => {
      // TODO: Split this and move state ownership to the respective components
      const [tasksData, userProfileData] = responses
      //TODO: Sorter
      //tasksData.res.sort(taskSorter)
      this.setState({
        tasks: tasksData.res,
        filteredTasks: tasksData.res,
        userProfile: userProfileData.res,
        isLoading: false,
      })
    })
  }

  render(): React.ReactNode {
    const { isSnackbarOpen, snackBarMessage, isLoading, tasks } = this.state

    if (isLoading) {
      return <Loading />
    }

    return (
      <Container maxWidth='md'>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignContent: 'center',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <IconButtonWithMenu
            keyName='filter'
            isActive={false}
            useChips={true}
            title='Group by'
            icon='Sort'
            options={[
              { name: 'Due Date', value: 'due_date' },
              { name: 'Labels', value: 'labels' },
            ]}
            onItemSelect={selected => {
              const section = TasksGrouper(selected.value, tasks)
              this.setState({
                taskSections: section,
                selectedTaskSection: selected.value,
                filteredTasks: tasks,
                selectedFilter: 'All',
              })
            }}
          />
        </Box>
        <AccordionGroup
          transition='0.2s ease'
          disableDivider
        >
          <Accordion
            title='All'
            sx={{
              my: 0,
            }}
            expanded={true}
          >
            <Divider orientation='horizontal'>
              <Chip
                variant='soft'
                color='neutral'
                size='md'
                onClick={() => {
                  // TODO: Expand/collapse
                }}
                endDecorator={
                  <ExpandCircleDown
                    color='primary'
                    sx={{ transform: 'rotate(180deg)' }}
                  />
                }
                startDecorator={
                  <Chip
                    color='primary'
                    size='sm'
                    variant='soft'
                  >
                    42
                  </Chip>
                }
              >
                All
              </Chip>
            </Divider>
            <AccordionDetails
              sx={{
                flexDirection: 'column',
                my: 0,
              }}
            >
              {tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onTaskUpdate={() => {}}
                  onTaskRemove={() => {}}
                  sx={{}}
                  viewOnly={false}
                />
              ))}
            </AccordionDetails>
          </Accordion>
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
            onClick={() => {
              this.props.navigate(`/tasks/create`)
            }}
          >
            <Add />
          </IconButton>
        </Box>
        <Snackbar
          open={isSnackbarOpen}
          onClose={() => {
            this.setState({ isSnackbarOpen: false })
          }}
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

export const MyTasks = withNavigation(MyTasksInner)
