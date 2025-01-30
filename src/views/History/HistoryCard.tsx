import {
  Box,
  ListDivider,
  ListItem,
  ListItemContent,
  Typography,
} from '@mui/joy'
import moment from 'moment'
import React from 'react'
import { CompletedChip } from './CompletedChip'

interface HistoryCardProps {
  allHistory: any[]
  historyEntry: any
  index: number
  onClick: () => void
}

export class HistoryCard extends React.Component<HistoryCardProps> {
  render(): React.ReactNode {
    function formatTimeDifference(startDate, endDate) {
      const diffInMinutes = moment(startDate).diff(endDate, 'minutes')
      let timeValue = diffInMinutes
      let unit = 'minute'

      if (diffInMinutes >= 60) {
        const diffInHours = moment(startDate).diff(endDate, 'hours')
        timeValue = diffInHours
        unit = 'hour'

        if (diffInHours >= 24) {
          const diffInDays = moment(startDate).diff(endDate, 'days')
          timeValue = diffInDays
          unit = 'day'
        }
      }

      return `${timeValue} ${unit}${timeValue !== 1 ? 's' : ''}`
    }

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
