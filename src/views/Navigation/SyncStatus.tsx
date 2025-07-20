import { CheckCircleOutline, ErrorOutline } from '@mui/icons-material'
import { CircularProgress, IconButton, Tooltip } from '@mui/joy'
import React from 'react'
import { connect } from 'react-redux'
import { RootState } from '@/store/store'

interface SyncStatusProps {
  style?: React.CSSProperties
  userStatus: 'loading' | 'succeeded' | 'failed'
  userError: string | null
  tasksStatus: 'loading' | 'succeeded' | 'failed'
  tasksError: string | null
  labelsStatus: 'loading' | 'succeeded' | 'failed'
  labelsError: string | null
  tokensStatus: 'loading' | 'succeeded' | 'failed'
  tokensError: string | null
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

    let icon: React.ReactNode
    if (anyFailed) {
      icon = <ErrorOutline color='danger' />
    } else if (allSucceeded) {
      icon = <CheckCircleOutline color='success' />
    } else {
      icon = <CircularProgress size='sm' />
    }

    const tooltipLines = statuses.map(s => `${s.name}: ${s.status}`)
    const errorLines = statuses
      .filter(s => s.error)
      .map(s => `${s.name}: ${s.error}`)

    let tooltipText = tooltipLines.join('\n')
    if (errorLines.length > 0) {
      tooltipText += `\n\nErrors:\n${errorLines.join('\n')}`
    }

    return (
      <Tooltip title={<span style={{ whiteSpace: 'pre-line' }}>{tooltipText}</span>}>
        <IconButton variant='plain' disabled style={this.props.style}>
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
