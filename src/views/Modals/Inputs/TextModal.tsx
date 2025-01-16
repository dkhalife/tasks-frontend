import { Box, Button, Modal, ModalDialog, Textarea, Typography } from '@mui/joy'
import React from 'react'
import { useState } from 'react'

interface TextModalProps {
  isOpen: boolean,
  onClose: () => void,
  onSave: (text: string) => void,
  current: string,
  title: string,
  okText: string,
  cancelText: string,
}

export class TextModal extends React.Component<TextModalProps> {
  render(): React.ReactNode {
    const { isOpen, onClose, onSave, current, title, okText, cancelText } = this.props
    const [text, setText] = useState(current)

    const handleSave = () => {
      onSave(text)
      onClose()
    }

    return (
      <Modal open={isOpen} onClose={onClose}>
        <ModalDialog>
          <Typography>{title}</Typography>
          <Textarea
            placeholder='Type in here…'
            value={text}
            onChange={e => setText(e.target.value)}
            minRows={2}
            maxRows={4}
            sx={{ minWidth: 300 }}
          />

          <Box display={'flex'} justifyContent={'space-around'} mt={1}>
            <Button onClick={handleSave} fullWidth sx={{ mr: 1 }}>
              {okText ? okText : 'Save'}
            </Button>
            <Button onClick={onClose} variant='outlined'>
              {cancelText ? cancelText : 'Cancel'}
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    )
  }
}
