import { Add, ExpandCircleDown } from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  Box,
  Chip,
  Container,
  Divider,
  IconButton,
  Snackbar,
  Typography,
} from '@mui/joy'
import { GetChores, GetUserProfile } from '../../utils/Fetcher'
import { Loading } from '../../Loading'
import { ChoreCard } from './ChoreCard'
import { IconButtonWithMenu } from './IconButtonWithMenu'

import { ChoresGrouper } from '../../utils/Chores'
import React from 'react'
import { withNavigation } from '../../contexts/hooks'
import { Chore, ChoreGroup } from '../../models/chore'
import { User } from '../../models/user'

interface MyChoresProps {
  navigate: (path: string) => void
}

interface MyChoresState {
  isSnackbarOpen: boolean
  snackBarMessage: string | null
  chores: Chore[]
  archivedChores: Chore[]
  filteredChores: Chore[]
  selectedFilter: string
  choreSections: ChoreGroup[]
  selectedChoreSection: string
  userProfile: User | null
  isLoading: boolean
}

class MyChoresInner extends React.Component<MyChoresProps, MyChoresState> {
  constructor(props) {
    super(props)

    this.state = {
      isSnackbarOpen: false,
      snackBarMessage: null,
      chores: [],
      archivedChores: [],
      filteredChores: [],
      selectedFilter: 'All',
      choreSections: [],
      selectedChoreSection: 'due_date',
      userProfile: null,
      isLoading: true,
    }
  }

  componentDidMount(): void {
    Promise.all([GetChores(), GetUserProfile()]).then(responses => {
      // TODO: Split this and move state ownership to the respective components
      const [choresResponse, userProfileResponse] = responses
      if (!choresResponse.ok) {
        throw new Error(choresResponse.statusText)
      }
      if (!userProfileResponse.ok) {
        throw new Error(userProfileResponse.statusText)
      }
      Promise.all([choresResponse.json(), userProfileResponse.json()]).then(
        data => {
          const [choresData, userProfileData] = data
          //TODO: Sorter
          //choresData.res.sort(choreSorter)
          this.setState({
            chores: choresData.res,
            filteredChores: choresData.res,
            userProfile: userProfileData.res,
            isLoading: false,
          })
        },
      )
    })
  }

  private FILTERS = {
    All: function (chores) {
      return chores
    },
    Overdue: function (chores) {
      return chores.filter(chore => {
        if (chore.nextDueDate === null) return false
        return new Date(chore.nextDueDate) < new Date()
      })
    },
    'Due today': function (chores) {
      return chores.filter(chore => {
        return (
          new Date(chore.nextDueDate).toDateString() ===
          new Date().toDateString()
        )
      })
    },
    'Due in week': function (chores) {
      return chores.filter(chore => {
        return (
          new Date(chore.nextDueDate) <
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
          new Date(chore.nextDueDate) > new Date()
        )
      })
    },
    'Due Later': function (chores) {
      return chores.filter(chore => {
        return (
          new Date(chore.nextDueDate) >
          new Date(Date.now() + 24 * 60 * 60 * 1000)
        )
      })
    },
    'No Due Date': function (chores) {
      return chores.filter(chore => {
        return chore.nextDueDate === null
      })
    },
  }

  render(): React.ReactNode {
    const { isSnackbarOpen, snackBarMessage, isLoading, chores } = this.state

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
              const section = ChoresGrouper(selected.value, chores)
              this.setState({
                choreSections: section,
                selectedChoreSection: selected.value,
                filteredChores: chores,
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
              {chores.map(chore => (
                <ChoreCard
                  key={chore.id}
                  chore={chore}
                  onChoreUpdate={() => {}}
                  onChoreRemove={() => {}}
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
              this.props.navigate(`/chores/create`)
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

export const MyChores = withNavigation(MyChoresInner)
