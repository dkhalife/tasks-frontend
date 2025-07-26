import React from 'react'
import { connect } from 'react-redux'
import { Alert, IconButton, Snackbar } from '@mui/joy'
import CloseIcon from '@mui/icons-material/Close'
import { RootState, AppDispatch } from '@/store/store'
import { Status, StatusSeverity } from '@/models/status'
import { dismissStatus } from '@/store/statusSlice'

interface StatusListProps {
  statuses: Status[]
  dismiss: (id: string) => void
}

class StatusListImpl extends React.Component<StatusListProps> {
  private mapSeverity = (severity: StatusSeverity) => {
    switch (severity) {
      case 'error':
        return 'danger'
      case 'success':
        return 'success'
      case 'warning':
        return 'warning'
      default:
        return 'primary'
    }
  }

  render(): React.ReactNode {
    const { statuses, dismiss } = this.props

    return (
      <>
        {statuses.map(status => (
          <Snackbar
            key={status.id}
            open={true}
            autoHideDuration={status.timeout}
            onClose={() => dismiss(status.id)}
            sx={{ zIndex: 2000 }}
          >
            <Alert
              color={this.mapSeverity(status.severity)}
              variant='soft'
              endDecorator={
                <IconButton
                  onClick={() => dismiss(status.id)}
                  variant='plain'
                  size='sm'
                >
                  <CloseIcon />
                </IconButton>
              }
            >
              {status.message}
            </Alert>
          </Snackbar>
        ))}
      </>
    )
  }
}

const mapStateToProps = (state: RootState) => ({
  statuses: state.status.items,
})

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  dismiss: (id: string) => dispatch(dismissStatus(id)),
})

export const StatusList = connect(
  mapStateToProps,
  mapDispatchToProps,
)(StatusListImpl)
