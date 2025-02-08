import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Input,
  Modal,
  ModalDialog,
  Typography,
} from '@mui/joy'
import React, { ChangeEvent } from 'react'

interface PasswordChangeModalProps {
  onClose: (newPassword: string | null) => void
}

interface PasswordChangeModalState {
  password: string
  confirmPassword: string
  passwordError: string | null
  isOpen: boolean
}

export class PassowrdChangeModal extends React.Component<
  PasswordChangeModalProps,
  PasswordChangeModalState
> {
  constructor(props: PasswordChangeModalProps) {
    super(props)
    this.state = {
      password: '',
      confirmPassword: '',
      passwordError: null,
      isOpen: false,
    }
  }

  public open(): void {
    this.setState({ isOpen: true })
  }

  onSave = () => {
    this.setState({ isOpen: false })
    this.props.onClose(this.state.password)
  }

  onCancel = () => {
    this.setState({ isOpen: false })
    this.props.onClose(null)
  }

  componentDidUpdate(
    prevPros: PasswordChangeModalProps,
    prevState: PasswordChangeModalState,
  ): void {
    const { password, confirmPassword } = this.state

    if (
      password === prevState.password &&
      confirmPassword === prevState.confirmPassword
    ) {
      return
    }

    if (password !== confirmPassword) {
      this.setState({ passwordError: 'Passwords do not match' })
    } else if (password.length < 8) {
      this.setState({ passwordError: 'Password must be at least 8 characters' })
    } else if (password.length > 50) {
      this.setState({
        passwordError: 'Password must be less than 50 characters',
      })
    } else {
      this.setState({ passwordError: null })
    }
  }

  public render(): React.ReactNode {
    const { password, confirmPassword, passwordError, isOpen } = this.state

    return (
      <Modal
        open={isOpen}
        onClose={this.onCancel}
      >
        <ModalDialog>
          <Typography
            level='h4'
            mb={1}
          >
            Change Password
          </Typography>

          <Typography
            level='body-md'
            gutterBottom
          >
            Please enter your new password.
          </Typography>
          <FormControl>
            <Typography alignSelf={'start'}>New Password</Typography>
            <Input
              required
              fullWidth
              name='password'
              type='password'
              id='password'
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                this.setState({ password: e.target.value })
              }}
            />
          </FormControl>

          <FormControl>
            <Typography alignSelf={'start'}>Confirm Password</Typography>
            <Input
              required
              fullWidth
              name='confirmPassword'
              type='password'
              id='confirmPassword'
              value={confirmPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                this.setState({ confirmPassword: e.target.value })
              }}
            />

            <FormHelperText>{passwordError}</FormHelperText>
          </FormControl>
          <Box
            display={'flex'}
            justifyContent={'space-around'}
            mt={1}
          >
            <Button
              disabled={passwordError != null}
              onClick={this.onSave}
              fullWidth
              sx={{ mr: 1 }}
            >
              Change Password
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
