import {
  Add,
  CancelRounded,
  EditCalendar,
  ExpandCircleDown,
  FilterAlt,
  Sort,
  Style,
  Unarchive,
} from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  IconButton,
  Input,
  List,
  Menu,
  MenuItem,
  Snackbar,
  Typography,
} from '@mui/joy'
import Fuse from 'fuse.js'
import { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../contexts/UserContext'
import { useChores } from '../../queries/ChoreQueries'
import {
  GetArchivedChores,
  GetChores,
  GetUserProfile,
} from '../../utils/Fetcher'
import { LoadingComponent } from '../components/Loading'
import { useLabels } from '../Labels/LabelQueries'
import { ChoreCard } from './ChoreCard'
import { IconButtonWithMenu } from './IconButtonWithMenu'

import { ChoresGrouper } from '../../utils/Chores'
import React from 'react'

export const MyChores = () => {
  const { userProfile, setUserProfile } = useContext(UserContext)
  const [isSnackbarOpen, setIsSnackbarOpen] = useState<boolean>(false)
  const [snackBarMessage, setSnackBarMessage] = useState<string | null>(null)
  const [chores, setChores] = useState([])
  const [archivedChores, setArchivedChores] = useState(null)
  const [filteredChores, setFilteredChores] = useState([])
  const [selectedFilter, setSelectedFilter] = useState('All')
  const [choreSections, setChoreSections] = useState([])
  const [selectedChoreSection, setSelectedChoreSection] = useState('due_date')
  const [openChoreSections, setOpenChoreSections] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
    const menuRef = useRef(null)
  const navigate = useNavigate()
  const { data: userLabels, isLoading: userLabelsLoading } = useLabels()
  const { data: choresData, isLoading: choresLoading } = useChores()
  const choreSorter = (a, b) => {
    // 1. Handle null due dates (always last):
    if (!a.nextDueDate && !b.nextDueDate) return 0 // Both null, no order
    if (!a.nextDueDate) return 1 // a is null, comes later
    if (!b.nextDueDate) return -1 // b is null, comes earlier

    const aDueDate = new Date(a.nextDueDate)
    const bDueDate = new Date(b.nextDueDate)
    const now = new Date()

    const oneDayInMs = 24 * 60 * 60 * 1000

    // 2. Prioritize tasks due today +- 1 day:
    const aTodayOrNear = Math.abs(aDueDate.getTime() - now.getTime()) <= oneDayInMs
    const bTodayOrNear = Math.abs(bDueDate.getTime() - now.getTime()) <= oneDayInMs
    if (aTodayOrNear && !bTodayOrNear) return -1 // a is closer
    if (!aTodayOrNear && bTodayOrNear) return 1 // b is closer

    // 3. Handle overdue tasks (excluding today +- 1):
    const aOverdue = aDueDate < now && !aTodayOrNear
    const bOverdue = bDueDate < now && !bTodayOrNear
    if (aOverdue && !bOverdue) return -1 // a is overdue, comes earlier
    if (!aOverdue && bOverdue) return 1 // b is overdue, comes earlier

    // 4. Sort future tasks by due date:
    return aDueDate.getTime() - bDueDate.getTime() // Sort ascending by due date
  }

  useEffect(() => {
    Promise.all([GetChores(), GetUserProfile()]).then(
      responses => {
        const [choresResponse, userProfileResponse] = responses
        if (!choresResponse.ok) {
          throw new Error(choresResponse.statusText)
        }
        if (!userProfileResponse.ok) {
          throw new Error(userProfileResponse.statusText)
        }
        Promise.all([
          choresResponse.json(),
          userProfileResponse.json(),
        ]).then(data => {
          const [choresData, userProfileData] = data
          setUserProfile(userProfileData.res)
          choresData.res.sort(choreSorter)
          setChores(choresData.res)
          setFilteredChores(choresData.res)
        })
      },
    )
  }, [setUserProfile])

  useEffect(() => {
    if (choresData) {
      const sortedChores = choresData.res.sort(choreSorter)
      setChores(sortedChores)
      setFilteredChores(sortedChores)
      const sections = ChoresGrouper('due_date', sortedChores)
      setChoreSections(sections)
      setOpenChoreSections(
        Object.keys(sections).reduce((acc, key) => {
          acc[key] = true
          return acc
        }, {}),
      )
    }
  }, [choresData, choresLoading])


  const handleLabelFiltering = chipClicked => {
    if (chipClicked.label) {
      const label = chipClicked.label
      const labelFiltered = [...chores].filter(chore =>
        chore.labels.some(
          l => l.id === label.id && l.created_by === label.created_by,
        ),
      )
      setFilteredChores(labelFiltered)
      setSelectedFilter('Label: ' + label.name)
    }
  }

  const handleChoreUpdated = (updatedChore, event) => {
    let newChores = chores.map(chore => {
      if (chore.id === updatedChore.id) {
        return updatedChore
      }
      return chore
    })

    let newFilteredChores = filteredChores.map(chore => {
      if (chore.id === updatedChore.id) {
        return updatedChore
      }
      return chore
    })
    if (event === 'archive') {
      newChores = newChores.filter(chore => chore.id !== updatedChore.id)
      newFilteredChores = newFilteredChores.filter(
        chore => chore.id !== updatedChore.id,
      )
      if (archivedChores !== null) {
        setArchivedChores([...archivedChores, updatedChore])
      }
    }
    if (event === 'unarchive') {
      newChores.push(updatedChore)
      newFilteredChores.push(updatedChore)
      setArchivedChores(
        archivedChores.filter(chore => chore.id !== updatedChore.id),
      )
    }
    setChores(newChores)
    setFilteredChores(newFilteredChores)
    setChoreSections(ChoresGrouper('due_date', newChores))

    switch (event) {
      case 'completed':
        setSnackBarMessage('Completed')
        break
      case 'skipped':
        setSnackBarMessage('Skipped')
        break
      case 'rescheduled':
        setSnackBarMessage('Rescheduled')
        break
      case 'unarchive':
        setSnackBarMessage('Unarchive')
        break
      case 'archive':
        setSnackBarMessage('Archived')
        break
      default:
        setSnackBarMessage('Updated')
    }
    setIsSnackbarOpen(true)
  }

  const handleChoreDeleted = deletedChore => {
    const newChores = chores.filter(chore => chore.id !== deletedChore.id)
    const newFilteredChores = filteredChores.filter(
      chore => chore.id !== deletedChore.id,
    )
    setChores(newChores)
    setFilteredChores(newFilteredChores)
    setChoreSections(ChoresGrouper('due_date', newChores))
  }

  const searchOptions = {
    keys: ['name', 'raw_label'],
    isCaseSensitive: false,
    findAllMatches: true,
  }

  const fuse = new Fuse(
    chores.map(c => ({
      ...c,
      raw_label: c.labels.map(c => c.name).join(' '),
    })),
    searchOptions,
  )

  const handleSearchChange = e => {
    if (selectedFilter !== 'All') {
      setSelectedFilter('All')
    }
    const search = e.target.value
    if (search === '') {
      setFilteredChores(chores)
      setSearchTerm('')
      return
    }

    const term = search.toLowerCase()
    setSearchTerm(term)
    setFilteredChores(fuse.search(term).map(result => result.item))
  }

  if (
    userProfile === null ||
    userLabelsLoading ||
    choresLoading
  ) {
    return <LoadingComponent />
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
        <Input
          placeholder='Search'
          value={searchTerm}
          fullWidth
          sx={{
            mt: 1,
            mb: 1,
            borderRadius: 24,
            height: 24,
            borderColor: 'text.disabled',
            padding: 1,
          }}
          onChange={handleSearchChange}
          endDecorator={
            searchTerm && (
              <CancelRounded
                onClick={() => {
                  setSearchTerm('')
                  setFilteredChores(chores)
                }}
              />
            )
          }
        />
        <IconButtonWithMenu
          icon={<Style />}
          title='Filter by Label'
          options={[
            ...userLabels,
            ...chores
              .map(c => c.labels)
              .flat()
              .filter(l => l.created_by !== userProfile.id)
              .map(l => {
                //  if user created it don't show it:
                return {
                  ...l,
                  name: l.name + ' (Shared Label)',
                }
              }),
          ]}
          selectedItem={selectedFilter}
          onItemSelect={selected => {
            handleLabelFiltering({ label: selected })
          }}
          isActive={selectedFilter.startsWith('Label: ')}
          useChips
        />

        <IconButton
          variant='outlined'
          color={
            selectedFilter && FILTERS[selectedFilter] && selectedFilter != 'All'
              ? 'primary'
              : 'neutral'
          }
          size='sm'
          sx={{
            height: 24,
            borderRadius: 24,
          }}
        >
          <FilterAlt />
        </IconButton>
        <List
          orientation='horizontal'
          wrap
          sx={{
            mt: 0.2,
          }}
        >
          <Menu ref={menuRef}>
            {Object.keys(FILTERS).map((filter, index) => (
              <MenuItem
                key={`filter-list-${filter}-${index}`}
                onClick={() => {
                  const filterFunction = FILTERS[filter]
                  const filteredChores =
                    filterFunction.length === 2
                      ? filterFunction(chores, userProfile.id)
                      : filterFunction(chores)
                  setFilteredChores(filteredChores)
                  setSelectedFilter(filter)
                }}
              >
                {filter}
                <Chip color={selectedFilter === filter ? 'primary' : 'neutral'}>
                  {FILTERS[filter].length === 2
                    ? FILTERS[filter](chores, userProfile.id).length
                    : FILTERS[filter](chores).length}
                </Chip>
              </MenuItem>
            ))}
            {selectedFilter.startsWith('Label: ') && (
              <MenuItem
                key={`filter-list-cancel-all-filters`}
                onClick={() => {
                  setFilteredChores(chores)
                  setSelectedFilter('All')
                }}
              >
                Cancel All Filters
              </MenuItem>
            )}
          </Menu>
        </List>
        <Divider orientation='vertical' />
        <IconButtonWithMenu
          title='Group by'
          icon={<Sort />}
          options={[
            { name: 'Due Date', value: 'due_date' },
            { name: 'Labels', value: 'labels' },
          ]}
          selectedItem={selectedChoreSection}
          onItemSelect={selected => {
            const section = ChoresGrouper(selected.value, chores)
            setChoreSections(section)
            setSelectedChoreSection(selected.value)
            setFilteredChores(chores)
            setSelectedFilter('All')
          }}
        />
      </Box>
      {selectedFilter !== 'All' && (
        <Chip
          level='title-md'
          gutterBottom
          color='warning'
          label={selectedFilter}
          onDelete={() => {
            setFilteredChores(chores)
            setSelectedFilter('All')
          }}
          endDecorator={<CancelRounded />}
          onClick={() => {
            setFilteredChores(chores)
            setSelectedFilter('All')
          }}
        >
          Current Filter: {selectedFilter}
        </Chip>
      )}
      {filteredChores.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            height: '50vh',
          }}
        >
          <EditCalendar
            sx={{
              fontSize: '4rem',
              mb: 1,
            }}
          />
          <Typography level='title-md' gutterBottom>
            Nothing scheduled
          </Typography>
          {chores.length > 0 && (
            <>
              <Button
                onClick={() => {
                  setFilteredChores(chores)
                  setSearchTerm('')
                }}
                variant='outlined'
                color='neutral'
              >
                Reset filters
              </Button>
            </>
          )}
        </Box>
      )}
      {(searchTerm?.length > 0 || selectedFilter !== 'All') &&
        filteredChores.map(chore => (
          <ChoreCard
            key={`filtered-${chore.id} `}
            chore={chore}
            onChoreUpdate={handleChoreUpdated}
            onChoreRemove={handleChoreDeleted}
            onChipClick={handleLabelFiltering}
          />
        ))}
      {searchTerm.length === 0 && selectedFilter === 'All' && (
        <AccordionGroup transition='0.2s ease' disableDivider>
          {choreSections.map((section, index) => {
            if (section.content.length === 0) return null
            return (
              <Accordion
                title={section.name}
                key={section.name + index}
                sx={{
                  my: 0,
                }}
                expanded={Boolean(openChoreSections[index])}
              >
                <Divider orientation='horizontal'>
                  <Chip
                    variant='soft'
                    color='neutral'
                    size='md'
                    onClick={() => {
                      if (openChoreSections[index]) {
                        const newOpenChoreSections = { ...openChoreSections }
                        delete newOpenChoreSections[index]
                        setOpenChoreSections(newOpenChoreSections)
                      } else {
                        setOpenChoreSections({
                          ...openChoreSections,
                          [index]: true,
                        })
                      }
                    }}
                    endDecorator={
                      openChoreSections[index] ? (
                        <ExpandCircleDown
                          color='primary'
                          sx={{ transform: 'rotate(180deg)' }}
                        />
                      ) : (
                        <ExpandCircleDown color='primary' />
                      )
                    }
                    startDecorator={
                      <>
                        <Chip color='primary' size='sm' variant='soft'>
                          {section?.content?.length}
                        </Chip>
                      </>
                    }
                  >
                    {section.name}
                  </Chip>
                </Divider>
                <AccordionDetails
                  sx={{
                    flexDirection: 'column',
                    my: 0,
                  }}
                >
                  {section.content?.map(chore => (
                    <ChoreCard
                      key={chore.id}
                      chore={chore}
                      onChoreUpdate={handleChoreUpdated}
                      onChoreRemove={handleChoreDeleted}
                      onChipClick={handleLabelFiltering}
                    />
                  ))}
                </AccordionDetails>
              </Accordion>
            )
          })}
        </AccordionGroup>
      )}
      <Box
        sx={{
          justifyContent: 'center',
          mt: 2,
        }}
      >
        {archivedChores === null && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              sx={{}}
              onClick={() => {
                GetArchivedChores()
                  .then(response => response.json())
                  .then(data => {
                    setArchivedChores(data.res)
                  })
              }}
              variant='outlined'
              color='neutral'
              startDecorator={<Unarchive />}
            >
              Show Archived
            </Button>
          </Box>
        )}
        {archivedChores !== null && (
          <>
            <Divider orientation='horizontal'>
              <Chip
                variant='soft'
                color='danger'
                size='md'
                startDecorator={
                  <>
                    <Chip color='danger' size='sm' variant='plain'>
                      {archivedChores?.length}
                    </Chip>
                  </>
                }
              >
                Archived
              </Chip>
            </Divider>

            {archivedChores?.map(chore => (
              <ChoreCard
                key={chore.id}
                chore={chore}
                onChoreUpdate={handleChoreUpdated}
                onChoreRemove={handleChoreDeleted}
                onChipClick={handleLabelFiltering}
              />
            ))}
          </>
        )}
      </Box>
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
            navigate(`/chores/create`)
          }}
        >
          <Add />
        </IconButton>
      </Box>
      <Snackbar
        open={isSnackbarOpen}
        onClose={() => {
          setIsSnackbarOpen(false)
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

const FILTERS = {
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
        new Date(chore.nextDueDate).toDateString() === new Date().toDateString()
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
        new Date(chore.nextDueDate) > new Date(Date.now() + 24 * 60 * 60 * 1000)
      )
    })
  },
  'No Due Date': function (chores) {
    return chores.filter(chore => {
      return chore.nextDueDate === null
    })
  },
}
