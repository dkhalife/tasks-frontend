import { moveFocusToJoyInput } from '@/utils/joy'
import { Box, Button, Modal, ModalDialog, Textarea, Typography } from '@mui/joy'
import React, { ChangeEvent } from 'react'

interface TextModalProps {
  title: string
  current?: string
  okText?: string
  cancelText?: string

  onClose: (newText: string | null) => void
}

interface TextModalState {
  isOpen: boolean
  text: string
}

export class TextModal extends React.Component<TextModalProps, TextModalState> {
  private inputRef = React.createRef<HTMLDivElement>()

  constructor(props: TextModalProps) {
    super(props)
    this.state = {
      isOpen: false,
      text: props.current ?? '',
    }
  }

  public open = async (): Promise<void> => {
    await this.setState({
      isOpen: true,
    })

    moveFocusToJoyInput(this.inputRef)
  }

  private onSave = () => {
    this.setState({ isOpen: false })
    this.props.onClose(this.state.text)
  }

  private onCancel = () => {
    this.setState({ isOpen: false })
    this.props.onClose(null)
  }

  private onTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({
      text: e.target.value,
    })
  }

  render(): React.ReactNode {
    const { title, okText, cancelText } = this.props
    const { text, isOpen } = this.state

    return (
      <Modal
        open={isOpen}
        onClose={this.onCancel}
      >
        <ModalDialog>
          <Typography>{title}</Typography>
          <Textarea
            placeholder='Type in here…'
            value={text}
            onChange={this.onTextChange}
            minRows={2}
            maxRows={4}
            ref={this.inputRef}
            sx={{ minWidth: 300 }}
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
              {okText ? okText : 'Save'}
            </Button>
            <Button
              onClick={this.onCancel}
              variant='outlined'
            >
              {cancelText ? cancelText : 'Cancel'}
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    )
  }
}
