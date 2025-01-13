import {
  Adjust,
  CancelRounded,
  CheckBox,
  Edit,
  HelpOutline,
  History,
  QueryBuilder,
  SearchRounded,
  Warning,
} from '@mui/icons-material'
import {
  Avatar,
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
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GetChores, MarkChoreComplete } from '../utils/Fetcher'
import { DateModal } from './Modals/Inputs/DateModal'
import React from 'react'

const CHORE_STATUS = {
  NO_DUE_DATE: 'No due date',
  DUE_SOON: 'Soon',
  DUE_NOW: 'Due',
  OVER_DUE: 'Overdue',
}

export const ChoresOverview = () => {
  const [chores, setChores] = useState([])
  const [filteredChores, setFilteredChores] = useState([])
  const [activeUserId, setActiveUserId] = useState(null)
  const [isDateModalOpen, setIsDateModalOpen] = useState(false)
  const [choreId, setChoreId] = useState(null)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const getChoreStatus = chore => {
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
  const getChoreStatusColor = chore => {
    switch (getChoreStatus(chore)) {
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

  useEffect(() => {
    GetChores()
      .then(response => response.json())
      .then(data => {
        setChores(data.res)
        setFilteredChores(data.res)
      })
    const user = JSON.parse(localStorage.getItem('user'))
    if (user != null && user.id > 0) {
      setActiveUserId(user.id)
    }
  }, [activeUserId, setActiveUserId])

  return (
    <Container>
      <Typography level='h4' mb={1.5}>
        Chores Overviews
      </Typography>

      <Grid container>
        <Grid
          item
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
              if (e.target.value === '') {
                setFilteredChores(chores)
              }
              setSearch(e.target.value)
              const newChores = chores.filter(chore => {
                return chore.name.includes(e.target.value)
              })
              setFilteredChores(newChores)
            }}
            endDecorator={
              search !== '' ? (
                <Button
                  variant='text'
                  onClick={() => {
                    setSearch('')
                    setFilteredChores(chores)
                  }}
                >
                  <CancelRounded />
                </Button>
              ) : (
                <Button variant='text'>
                  <SearchRounded />
                </Button>
              )
            }
          ></Input>
        </Grid>
        <Grid item sm={6} justifyContent={'flex-end'} display={'flex'} gap={2}>
          <Button
            onClick={() => {
              navigate(`/chores/create`)
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
          {filteredChores.map((chore: any) => (
            <tr key={chore.id}>
              <td>
                <Chip color={getChoreStatusColor(chore)}>
                  {getChoreStatus(chore)}
                </Chip>
              </td>
              <td
                onClick={() => {
                  navigate(`/chores/${chore.id}/edit`)
                }}
              >
                {chore.name || '--'}
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
                              setChores(newChores)
                              setFilteredChores(newChores)
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
                      setChoreId(chore.id)
                      setIsDateModalOpen(true)
                    }}
                    aria-setsize={2}
                  >
                    <History />
                  </IconButton>
                  <IconButton
                    variant='outlined'
                    size='sm'
                    onClick={() => {
                      navigate(`/chores/${chore.id}/edit`)
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
        title={`Change due date`}
        onClose={() => {
          setIsDateModalOpen(false)
        }}
        onSave={date => {
          MarkChoreComplete(choreId, null, date).then(
            response => {
              if (response.ok) {
                response.json().then(data => {
                  const newChore = data.res
                  const newChores = [...chores]
                  const index = newChores.findIndex(c => c.id === chore.id)
                  newChores[index] = newChore
                  setChores(newChores)
                  setFilteredChores(newChores)
                })
              }
            },
          )
        }}
      />
    </Container>
  )
}
