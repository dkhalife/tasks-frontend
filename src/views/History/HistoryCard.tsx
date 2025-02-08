import { HistoryEntry } from '@/models/history'
import { formatTimeDifference } from '@/utils/date'
import { ListItemContent, ListDivider } from '@mui/joy'
import { ListItem, Box, Typography } from '@mui/joy'
import moment from 'moment'
import React from 'react'
import { CompletedChip } from './CompletedChip'

interface HistoryCardProps {
  allHistory: HistoryEntry[]
  historyEntry: HistoryEntry
  index: number
  onClick: () => void
}

export class HistoryCard extends React.Component<HistoryCardProps> {
  render(): React.ReactNode {
    const { allHistory, historyEntry, index, onClick } = this.props

    return (
      <>
        <ListItem
          sx={{ gap: 1.5, alignItems: 'flex-start' }}
          onClick={onClick}
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
                {historyEntry.completedAt
                  ? moment(historyEntry.completedAt).format(
                      'ddd MM/DD/yyyy HH:mm',
                    )
                  : 'Skipped'}
              </Typography>
              <CompletedChip
                dueDate={historyEntry.dueDate}
                completedAt={historyEntry.completedAt}
              />
            </Box>
            {historyEntry.dueDate && (
              <Typography>
                Due: {moment(historyEntry.dueDate).format('ddd MM/DD/yyyy')}
              </Typography>
            )}
            {historyEntry.notes && (
              <Typography>Note: {historyEntry.notes}</Typography>
            )}
          </ListItemContent>
        </ListItem>
        {index < allHistory.length - 1 && (
          <>
            <ListDivider component='li'>
              {index < allHistory.length - 1 &&
                allHistory[index + 1].completedAt && (
                  <Typography>
                    {formatTimeDifference(
                      historyEntry.completedAt,
                      allHistory[index + 1].completedAt,
                    )}
                    &nbsp;before
                  </Typography>
                )}
            </ListDivider>
          </>
        )}
      </>
    )
  }
}
