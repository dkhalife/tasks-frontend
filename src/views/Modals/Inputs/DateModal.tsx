import { moveFocusToJoyInput } from '@/utils/joy'
import { Modal, Button, Input, ModalDialog, Box, Typography } from '@mui/joy'
import moment from 'moment'
import React from 'react'

interface DateModalProps {
  title: string

  onClose: (newDate: Date | null) => void
}

interface DateModalState {
  date: Date | null
  isOpen: boolean
}

export class DateModal extends React.Component<DateModalProps, DateModalState> {
  private inputRef: React.RefObject<HTMLInputElement> = React.createRef()
  constructor(props: DateModalProps) {
    super(props)

    this.state = {
      date: null,
      isOpen: false,
    }
  }

  public open = async (current: Date | null): Promise<void> => {
    await this.setState({
      date: current,
      isOpen: true,
    })

    moveFocusToJoyInput(this.inputRef)
  }

  private onSave = () => {
    this.setState({
      isOpen: false,
    })
    this.props.onClose(this.state.date)
  }

  private onCancel = () => {
    this.setState({
      isOpen: false,
    })
    this.props.onClose(null)
  }

  private onDateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({
      date: moment(e.target.value).toDate(),
    })
  }

  private onDateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      this.onSave()
      e.preventDefault()
      e.stopPropagation()
    }
  }

  public render(): React.ReactNode {
    const { title } = this.props
    const { isOpen } = this.state
    const date = moment(this.state.date).format('yyyy-MM-DD[T]HH:mm')

    return (
      <Modal
        open={isOpen}
        onClose={this.onCancel}
      >
        <ModalDialog>
          <Typography>{title}</Typography>
          <Input
            sx={{ mt: 3 }}
            type='datetime-local'
            value={date}
            onChange={this.onDateChange}
            onKeyDown={this.onDateKeyDown}
            ref={this.inputRef}
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
