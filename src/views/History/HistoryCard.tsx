import { HistoryEntry } from '@/models/history'
import { ListItemContent, ListDivider } from '@mui/joy'
import { ListItem, Box, Typography } from '@mui/joy'
import moment from 'moment'
import React from 'react'
import { CompletedChip } from './CompletedChip'

interface HistoryCardProps {
  historyEntry: HistoryEntry
}

export class HistoryCard extends React.Component<HistoryCardProps> {
  render(): React.ReactNode {
    const { historyEntry } = this.props

    return (
      <>
        <ListItem
          sx={{
            gap: 1.5,
            alignItems: 'flex-start',
          }}
        >
          <ListItemContent sx={{ my: 0 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography sx={{ fontWeight: 'md' }}>
                {historyEntry.completed_date
                  ? <strong title={moment(historyEntry.completed_date).format('ddd MM/DD/yyyy HH:mm')}>Completed</strong> :
                  <strong>Skipped</strong>}
              </Typography>
              <CompletedChip
                dueDate={historyEntry.due_date}
                completedDate={historyEntry.completed_date}
              />
            </Box>
            {historyEntry.due_date && (
              <Typography>
                due on {moment(historyEntry.due_date).format('MMMM Do YYYY, h:mm a')}
              </Typography>
            )}
          </ListItemContent>
        </ListItem>
        <ListDivider component='li'>
          <Typography>
            { historyEntry.completed_date ? moment(historyEntry.completed_date).fromNow() : '-'}
          </Typography>
        </ListDivider>
      </>
    )
  }
}
