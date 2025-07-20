import { CheckCircleOutline, ErrorOutline } from '@mui/icons-material'
import { CircularProgress, IconButton, Tooltip } from '@mui/joy'
import React from 'react'
import { connect } from 'react-redux'
import { RootState } from '@/store/store'
import { SyncState } from '@/models/sync'

interface SyncStatusProps {
  style?: React.CSSProperties
  userStatus: SyncState
  userError: string | null
  tasksStatus: SyncState
  tasksError: string | null
  labelsStatus: SyncState
  labelsError: string | null
  tokensStatus: SyncState
  tokensError: string | null
}

function getIcon(status: SyncState): React.ReactNode {
  switch (status) {
    case 'failed':
      return <ErrorOutline color='error' />
    case 'succeeded':
      return <CheckCircleOutline color='success' />
    default:
      return <CircularProgress size='sm' />
  }
}

class SyncStatusImpl extends React.Component<SyncStatusProps> {
  render(): React.ReactNode {
    const {
      userStatus,
      tasksStatus,
      labelsStatus,
      tokensStatus,
      userError,
      tasksError,
      labelsError,
      tokensError,
    } = this.props

    const statuses = [
      { name: 'User', status: userStatus, error: userError },
      { name: 'Tasks', status: tasksStatus, error: tasksError },
      { name: 'Labels', status: labelsStatus, error: labelsError },
      { name: 'Tokens', status: tokensStatus, error: tokensError },
    ]

    const anyFailed = statuses.some(s => s.status === 'failed')
    const allSucceeded = statuses.every(s => s.status === 'succeeded')
    const icon = getIcon(anyFailed ? 'failed' : allSucceeded ? 'succeeded' : 'loading')

    const tooltipText = (
      <>
        {statuses.map(s => (
          <>
            <span key={s.name}>{s.name}: {getIcon(s.status)}</span><br />
          </>
        ))}
        {anyFailed && (
          <>
            <span><u><strong>Errors:</strong></u></span><br />
            {statuses.filter(s => s.error).map(s => (
              <span key={s.name + '-error'}>{s.name}: {s.error}</span>
            ))}
          </>
        )}
      </>
    )

    return (
      <Tooltip title={tooltipText}>
        <IconButton variant='plain' style={this.props.style}>
          {icon}
        </IconButton>
      </Tooltip>
    )
  }
}

const mapStateToProps = (state: RootState) => ({
  userStatus: state.user.status,
  userError: state.user.error,
  tasksStatus: state.tasks.status,
  tasksError: state.tasks.error,
  labelsStatus: state.labels.status,
  labelsError: state.labels.error,
  tokensStatus: state.tokens.status,
  tokensError: state.tokens.error,
})

export const SyncStatus = connect(mapStateToProps)(SyncStatusImpl)
