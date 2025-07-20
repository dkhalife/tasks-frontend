import { moveFocusToJoyInput } from '@/utils/joy'
import { TaskUI } from '@/utils/marshalling'
import { Modal, Button, Input, ModalDialog, Box, Typography } from '@mui/joy'
import { format, parseISO } from 'date-fns'
import React from 'react'

interface DateModalProps {
  title: string
}

type DateModalClosedHandler = (task: TaskUI, newDate: Date | null) => void

type ClosedDateModalState = {
  isOpen: false
  date: null
  taskBeingEdited: null
  onClose: null
}

type OpenDateModalState = {
  isOpen: true
  taskBeingEdited: TaskUI
  date: Date | null
  onClose: DateModalClosedHandler
}

type DateModalState = ClosedDateModalState | OpenDateModalState

export class DateModal extends React.Component<DateModalProps, DateModalState> {
  private inputRef: React.RefObject<HTMLInputElement> = React.createRef()
  constructor(props: DateModalProps) {
    super(props)

    this.state = {
      date: null,
      taskBeingEdited: null,
      isOpen: false,
      onClose: null
    }
  }

  public open = async (taskBeingEdited: TaskUI, date: Date | null, onClose: DateModalClosedHandler): Promise<void> => {
    await this.setState({
      isOpen: true,
      date: date,
      taskBeingEdited,
      onClose,
    })

    moveFocusToJoyInput(this.inputRef)
  }

  private onSave = () => {
    const state = this.state as OpenDateModalState
    const { taskBeingEdited: task, date, onClose } = state

    this.setState({
      isOpen: false,
      date: null,
      taskBeingEdited: null,
      onClose: null,
    })

    onClose(task, date)
  }

  private onCancel = () => {
    this.setState({
      isOpen: false,
      date: null,
      taskBeingEdited: null,
      onClose: null,
    })
  }

  private onDateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.value === '') {
      return
    }

    this.setState({
      date: parseISO(e.target.value),
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
    const date = format(this.state.date ?? new Date(), "yyyy-MM-dd'T'HH:mm")

    return (
      <Modal
        open={isOpen}
        onClose={this.onCancel}
      >
        <ModalDialog>
          <Typography
            level='h4'>{title}</Typography>
          <Input
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
