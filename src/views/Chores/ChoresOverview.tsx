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
import { DateModal } from '../Modals/Inputs/DateModal'
import React, { ChangeEvent } from 'react'
import { withNavigation } from '../../contexts/hooks'
import { Chore, getDueDateChipColor, getDueDateChipText } from '../../models/chore'
import { User } from '../../models/user'
import { GetChores, MarkChoreComplete } from '../../api/chores'

interface ChoresOverviewProps {
  navigate: (path: string) => void
}

interface ChoresOverviewState {
  chores: Chore[]
  filteredChores: Chore[]
  search: string
  choreId: string | null
  activeUserId: number | null
}

class ChoresOverviewInner extends React.Component<
  ChoresOverviewProps,
  ChoresOverviewState
> {
  private dateModalRef = React.createRef<DateModal>()

  constructor(props: ChoresOverviewProps) {
    super(props)
    this.state = {
      chores: [],
      filteredChores: [],
      search: '',
      choreId: null,
      activeUserId: null,
    }
  }

  componentDidMount(): void {
    GetChores()
      .then(data => {
        this.setState({ chores: data.res, filteredChores: data.res })
      })

    const user = JSON.parse(localStorage.getItem('user') as string) as User
    if (user != null && user.id > 0) {
      this.setState({ activeUserId: user.id })
    }
  }

  private onCloseDateModal = (date: string | null) => {
    if (!date) {
      return
    }

    const { chores, choreId } = this.state
    if (!choreId) {
      return
    }

    MarkChoreComplete(choreId, new Date(date)).then(data => {
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

  render(): React.ReactNode {
    const { chores, filteredChores, search, choreId } =
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
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
                  <Chip color={getDueDateChipColor(chore.nextDueDate)}>
                    {getDueDateChipText(chore.nextDueDate)}
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
                        MarkChoreComplete(chore.id, null).then(data => {
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
                        })
                        this.dateModalRef.current?.open()
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
          ref={this.dateModalRef}
          key={choreId}
          current=''
          title={`Change due date`}
          onClose={this.onCloseDateModal}
        />
      </Container>
    )
  }
}

export const ChoresOverview = withNavigation(ChoresOverviewInner)
