import {
  Box,
  Button,
  ColorPaletteProp,
  Modal,
  ModalDialog,
  Typography,
} from '@mui/joy'
import React from 'react'

export interface ConfirmationModalProps {
  title: string
  message: string
  confirmText: string
  cancelText: string
  color?: ColorPaletteProp

  onClose: (isConfirmed: boolean) => void
}

interface ConfirmationModalState {
  isOpen: boolean
}

export class ConfirmationModal extends React.Component<
  ConfirmationModalProps,
  ConfirmationModalState
> {
  private confirmButtonRef: React.RefObject<HTMLButtonElement> =
    React.createRef()

  constructor(props: ConfirmationModalProps) {
    super(props)

    this.state = {
      isOpen: false,
    }
  }

  public async open(): Promise<void> {
    await this.setState({
      isOpen: true,
    })

    this.confirmButtonRef.current?.focus()
  }

  private onConfirm = () => {
    this.setState({ isOpen: false })
    this.props.onClose(true)
  }

  private onCancel = () => {
    this.setState({ isOpen: false })
    this.props.onClose(false)
  }

  public render(): React.ReactNode {
    const { title, message, confirmText, cancelText, color } = this.props
    const { isOpen } = this.state

    return (
      <Modal
        open={isOpen}
        onClose={this.onCancel}
      >
        <ModalDialog>
          <Typography
            level='h4'
          >
            {title}
          </Typography>

          <Typography
            level='body-md'
            gutterBottom
          >
            {message}
          </Typography>

          <Box
            display={'flex'}
            justifyContent={'space-around'}
            mt={1}
          >
            <Button
              onClick={this.onConfirm}
              fullWidth
              sx={{ mr: 1 }}
              color={color ?? 'primary'}
              ref={this.confirmButtonRef}
            >
              {confirmText}
            </Button>
            <Button
              onClick={this.onCancel}
              variant='outlined'
            >
              {cancelText}
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    )
  }
}
