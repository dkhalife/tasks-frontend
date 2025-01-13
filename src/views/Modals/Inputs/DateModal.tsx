import { useState } from 'react'
import { Modal, Button, Input, ModalDialog, Box, Typography } from '@mui/joy'
import React from 'react'

export function DateModal({ isOpen, onClose, onSave, current, title }) {
  const [date, setDate] = useState(
    current ? new Date(current).toISOString().split('T')[0] : null,
  )

  const handleSave = () => {
    onSave(date)
    onClose()
  }

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalDialog>
        <Typography variant='h4'>{title}</Typography>
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
