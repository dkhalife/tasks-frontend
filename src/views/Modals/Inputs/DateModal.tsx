import { Modal, Button, Input, ModalDialog, Box, Typography } from '@mui/joy'
import React from 'react'

interface DateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (date: string) => void
  current: string
  title: string
}

interface DateModalState {
  date: string
}

export class DateModal extends React.Component<DateModalProps, DateModalState> {
  constructor(props: DateModalProps) {
    super(props)

    this.state = {
      date: props.current
        ? new Date(props.current).toISOString().split('T')[0]
        : '',
    }
  }

  private handleSave = () => {
    const { onSave, onClose } = this.props
    const { date } = this.state

    onSave(date)
    onClose()
  }

  public render(): React.ReactNode {
    const { isOpen, onClose, title } = this.props
    const { date } = this.state

    return (
      <Modal
        open={isOpen}
        onClose={onClose}
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
              onClick={this.handleSave}
              fullWidth
              sx={{ mr: 1 }}
            >
              Save
            </Button>
            <Button
              onClick={onClose}
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
