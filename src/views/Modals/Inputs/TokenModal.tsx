import { ApiTokenScope } from '@/utils/api'
import { moveFocusToJoyInput } from '@/utils/joy'
import { TokenScopes } from '@/views/Tokens/TokenScopes'
import { Box, Button, FormControl, Input, Modal, ModalDialog, Typography } from '@mui/joy'
import React, { ChangeEvent } from 'react'

interface TokenModalProps {
  title: string
  current?: string
  okText?: string
  cancelText?: string

  onClose: (newName: string | null, scopes: ApiTokenScope[]) => void
}

interface TokenModalState {
  isOpen: boolean
  name: string
  errorName: boolean
  scopes: ApiTokenScope[]
}

export class TokenModal extends React.Component<TokenModalProps, TokenModalState> {
  private inputRef = React.createRef<HTMLDivElement>()

  constructor(props: TokenModalProps) {
    super(props)
    this.state = {
      isOpen: false,
      name: props.current ?? '',
      errorName: false,
      scopes: [],
    }
  }

  public open = async (): Promise<void> => {
    await this.setState({
      isOpen: true,
    })

    moveFocusToJoyInput(this.inputRef)
  }

  private onSave = () => {
    const { name, scopes, errorName } = this.state

    if (errorName) {
      return
    }

    this.setState({
      isOpen: false,
      name: '',
      scopes: [],
    })

    this.props.onClose(name, scopes)
  }

  private onCancel = () => {
    this.setState({
      isOpen: false,
      name: '',
      scopes: [],
    })

    this.props.onClose(null, [])
  }

  private onNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      name: e.target.value,
      errorName: e.target.value.length === 0,
    })
  }

  private onScopesChange = (scopes: ApiTokenScope[]) => {
    this.setState({
      scopes,
    })
  }

  render(): React.ReactNode {
    const { title, okText, cancelText } = this.props
    const { name, isOpen, errorName, scopes } = this.state

    const validState = name.length > 0 && scopes.length > 0
    console.log('scopes', scopes)

    return (
      <Modal
        open={isOpen}
        onClose={this.onCancel}
      >
        <ModalDialog>
          <FormControl error>
            <Typography>{title}</Typography>
            <Input
              placeholder='Name your token'
              value={name}
              onChange={this.onNameChange}
              error={errorName}
              ref={this.inputRef}
              sx={{ minWidth: 300 }}
            />
          </FormControl>

          <TokenScopes onChange={this.onScopesChange} />

          <Box
            display={'flex'}
            justifyContent={'space-around'}
            mt={1}
          >
            <Button
              onClick={this.onSave}
              fullWidth
              disabled={!validState}
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
