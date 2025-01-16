import { useState } from 'react'
import { Modal, Button, Input, ModalDialog, Box, Typography } from '@mui/joy'
import React from 'react'

interface DateModalProps {
  isOpen: boolean,
  onClose: () => void,
  onSave: (date: string) => void,
  current: string,
  title: string
}

export class DateModal extends React.Component<DateModalProps> {
  public render(): React.ReactNode {
    const { isOpen, onClose, onSave, current, title } = this.props
    const [date, setDate] = useState<string>(
      current ? new Date(current).toISOString().split('T')[0] : "",
    )

    const handleSave = () => {
      onSave(date)
      onClose()
    }

    return (
      <Modal open={isOpen} onClose={onClose}>
        <ModalDialog>
          <Typography>{title}</Typography>
          <Input
            sx={{ mt: 3 }}
            type='date'
            value={date}
            onChange={e => setDate(e.target.value)}
          />
          <Box display={'flex'} justifyContent={'space-around'} mt={1}>
            <Button onClick={handleSave} fullWidth sx={{ mr: 1 }}>
              Save
            </Button>
            <Button onClick={onClose} variant='outlined'>
              Cancel
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    )
  }
}
