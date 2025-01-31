import { Modal, Button, Input, ModalDialog, Box, Typography } from '@mui/joy'
import React from 'react'

interface DateModalProps {
  current: string
  title: string

  onClose: (newDate: string | null) => void
}

interface DateModalState {
  date: string
  isOpen: boolean
}

export class DateModal extends React.Component<DateModalProps, DateModalState> {
  constructor(props: DateModalProps) {
    super(props)

    this.state = {
      date: props.current
        ? new Date(props.current).toISOString().split('T')[0]
        : '',
      isOpen: false,
    }
  }

  public open(): void {
    this.setState({ isOpen: true })
  }

  private onSave(): void {
    this.setState({ isOpen: false })
    this.props.onClose(this.state.date)
  }

  private onCancel(): void {
    this.setState({ isOpen: false })
    this.props.onClose(null)
  }

  public render(): React.ReactNode {
    const { title } = this.props
    const { isOpen } = this.state
    const { date } = this.state

    return (
      <Modal
        open={isOpen}
        onClose={this.onCancel}
      >
        <ModalDialog>
          <Typography>{title}</Typography>
          <Input
            sx={{ mt: 3 }}
            type='date'
            value={date}
            onChange={e => this.setState({ date: e.target.value })}
          />
          <Box
            display={'flex'}
            justifyContent={'space-around'}
            mt={1}
          >
            <Button
              onClick={this.onSave}
              fullWidth
              sx={{ mr: 1 }}
            >
              Save
            </Button>
            <Button
              onClick={this.onCancel}
              variant='outlined'
            >
              Cancel
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    )
  }
}
