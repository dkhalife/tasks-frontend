import { Box, Button, ColorPaletteProp, Modal, ModalDialog, Typography } from '@mui/joy'
import React from 'react'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: (isConfirmed: boolean) => void
  title: string
  message: string
  confirmText: string
  cancelText: string
  color?: ColorPaletteProp
}

export class ConfirmationModal extends React.Component<ConfirmationModalProps> {
  public render(): React.ReactNode {
    const { isOpen, onClose, title, message, confirmText, cancelText, color } = this.props

    const handleAction = isConfirmed => {
      onClose(isConfirmed)
    }

    return (
      <Modal open={isOpen} onClose={onClose}>
        <ModalDialog>
          <Typography level='h4' mb={1}>
            {title}
          </Typography>

          <Typography level='body-md' gutterBottom>
            {message}
          </Typography>

          <Box display={'flex'} justifyContent={'space-around'} mt={1}>
            <Button
              onClick={() => {
                handleAction(true)
              }}
              fullWidth
              sx={{ mr: 1 }}
              color={color ?? 'primary'}
            >
              {confirmText}
            </Button>
            <Button
              onClick={() => {
                handleAction(false)
              }}
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
