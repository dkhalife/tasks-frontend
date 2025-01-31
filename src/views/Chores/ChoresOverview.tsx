import {
  CancelRounded,
  CheckBox,
  Edit,
  History,
  SearchRounded,
} from '@mui/icons-material'
import {
  Button,
  ButtonGroup,
  Chip,
  Container,
  Grid,
  IconButton,
  Input,
  Table,
  Tooltip,
  Typography,
} from '@mui/joy'

import moment from 'moment'
import { GetChores, MarkChoreComplete } from '../../utils/Fetcher'
import { DateModal } from '../Modals/Inputs/DateModal'
import React from 'react'
import { withNavigation } from '../../contexts/hooks'
import { Chore } from '../../models/chore'
import { User } from '../../models/user'

const CHORE_STATUS = {
  NO_DUE_DATE: 'No due date',
  DUE_SOON: 'Soon',
  DUE_NOW: 'Due',
  OVER_DUE: 'Overdue',
}

interface ChoresOverviewProps {
  navigate: (path: string) => void
}

interface ChoresOverviewState {
  chores: Chore[]
  filteredChores: Chore[]
  search: string
  choreId: string | null
  isDateModalOpen: boolean
  activeUserId: number | null
}

class ChoresOverviewInner extends React.Component<
  ChoresOverviewProps,
  ChoresOverviewState
> {
  constructor(props: ChoresOverviewProps) {
    super(props)
    this.state = {
      chores: [],
      filteredChores: [],
      search: '',
      choreId: null,
      isDateModalOpen: false,
      activeUserId: null,
    }
  }

  private getChoreStatus = chore => {
    if (chore.nextDueDate === null) {
      return CHORE_STATUS.NO_DUE_DATE
    }
    const dueDate = new Date(chore.nextDueDate)
    const now = new Date()
    const diff = dueDate.getTime() - now.getTime()
    if (diff < 0) {
      return CHORE_STATUS.OVER_DUE
    }
    if (diff > 1000 * 60 * 60 * 24) {
      return CHORE_STATUS.DUE_NOW
    }
    if (diff > 0) {
      return CHORE_STATUS.DUE_SOON
    }
    return CHORE_STATUS.NO_DUE_DATE
  }

  private getChoreStatusColor = chore => {
    switch (this.getChoreStatus(chore)) {
      case CHORE_STATUS.NO_DUE_DATE:
        return 'neutral'
      case CHORE_STATUS.DUE_SOON:
        return 'success'
      case CHORE_STATUS.DUE_NOW:
        return 'primary'
      case CHORE_STATUS.OVER_DUE:
        return 'warning'
      default:
        return 'neutral'
    }
  }

  componentDidMount(): void {
    GetChores()
      .then(response => response.json())
      .then(data => {
        this.setState({ chores: data.res, filteredChores: data.res })
      })

    const user = JSON.parse(localStorage.getItem('user') as string) as User
    if (user != null && user.id > 0) {
      this.setState({ activeUserId: user.id })
    }
  }

  render(): React.ReactNode {
    const { chores, filteredChores, search, choreId, isDateModalOpen } =
      this.state

    return (
      <Container>
        <Typography
          level='h4'
          mb={1.5}
        >
          Chores Overviews
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
              placeholder='Search'
              value={search}
              onChange={e => {
                const newChores = chores.filter(chore => {
                  return chore.title.includes(e.target.value)
                })

                const newState = {
                  search: e.target.value,
                  filteredChores: e.target.value === '' ? chores : newChores,
                }
                this.setState(newState)
              }}
              endDecorator={
                search !== '' ? (
                  <Button
                    onClick={() => {
                      this.setState({ search: '', filteredChores: chores })
                    }}
                  >
                    <CancelRounded />
                  </Button>
                ) : (
                  <Button>
                    <SearchRounded />
                  </Button>
                )
              }
            ></Input>
          </Grid>
          <Grid
            sm={6}
            justifyContent={'flex-end'}
            display={'flex'}
            gap={2}
          >
            <Button
              onClick={() => {
                this.props.navigate(`/chores/create`)
              }}
            >
              New Chore
            </Button>
          </Grid>
        </Grid>

        <Table>
          <thead>
            <tr>
              <th style={{ width: 100 }}>Due</th>
              <th>Chore</th>
              <th>Due</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredChores.map((chore: Chore) => (
              <tr key={chore.id}>
                <td>
                  <Chip color={this.getChoreStatusColor(chore)}>
                    {this.getChoreStatus(chore)}
                  </Chip>
                </td>
                <td
                  onClick={() => {
                    this.props.navigate(`/chores/${chore.id}/edit`)
                  }}
                >
                  {chore.title || '--'}
                </td>
                <td>
                  <Tooltip
                    title={
                      chore.nextDueDate === null
                        ? 'no due date'
                        : moment(chore.nextDueDate).format('YYYY-MM-DD')
                    }
                    size='sm'
                  >
                    <Typography>
                      {chore.nextDueDate === null
                        ? '--'
                        : moment(chore.nextDueDate).fromNow()}
                    </Typography>
                  </Tooltip>
                </td>

                <td>
                  <ButtonGroup>
                    <IconButton
                      variant='outlined'
                      size='sm'
                      onClick={() => {
                        MarkChoreComplete(chore.id, null, null).then(
                          response => {
                            if (response.ok) {
                              response.json().then(data => {
                                const newChore = data.res
                                const newChores = [...chores]
                                const index = newChores.findIndex(
                                  c => c.id === chore.id,
                                )
                                newChores[index] = newChore

                                this.setState({
                                  chores: newChores,
                                  filteredChores: newChores,
                                })
                              })
                            }
                          },
                        )
                      }}
                      aria-setsize={2}
                    >
                      <CheckBox />
                    </IconButton>
                    <IconButton
                      variant='outlined'
                      size='sm'
                      onClick={() => {
                        this.setState({
                          choreId: chore.id,
                          isDateModalOpen: true,
                        })
                      }}
                      aria-setsize={2}
                    >
                      <History />
                    </IconButton>
                    <IconButton
                      variant='outlined'
                      size='sm'
                      onClick={() => {
                        this.props.navigate(`/chores/${chore.id}/edit`)
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </ButtonGroup>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <DateModal
          isOpen={isDateModalOpen}
          key={choreId}
          current=''
          title={`Change due date`}
          onClose={() => {
            this.setState({ isDateModalOpen: false })
          }}
          onSave={date => {
            MarkChoreComplete(choreId, null, date).then(response => {
              if (response.ok) {
                response.json().then(data => {
                  const newChore = data.res
                  const newChores = [...chores]
                  const index = newChores.findIndex(c => c.id === newChore.id)
                  newChores[index] = newChore

                  this.setState({
                    chores: newChores,
                    filteredChores: newChores,
                  })
                })
              }
            })
          }}
        />
      </Container>
    )
  }
}

export const ChoresOverview = withNavigation(ChoresOverviewInner)
