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
import React, { useEffect } from 'react'

interface PassowrdChangeModalProps {
  isOpen: boolean,
  onClose: (password: string | null) => void,
}

export class PassowrdChangeModal extends React.Component<PassowrdChangeModalProps> {
  public render(): React.ReactNode {
    const { isOpen, onClose } = this.props
    const [password, setPassword] = React.useState('')
    const [confirmPassword, setConfirmPassword] = React.useState('')
    const [passwordError, setPasswordError] = React.useState<string | null>(null)
    const [passwordTouched, setPasswordTouched] = React.useState(false)
    const [confirmPasswordTouched, setConfirmPasswordTouched] =
      React.useState(false)
    useEffect(() => {
      if (!passwordTouched || !confirmPasswordTouched) {
        return
      } else if (password !== confirmPassword) {
        setPasswordError('Passwords do not match')
      } else if (password.length < 8) {
        setPasswordError('Password must be at least 8 characters')
      } else if (password.length > 50) {
        setPasswordError('Password must be less than 50 characters')
      } else {
        setPasswordError(null)
      }
    }, [password, confirmPassword, passwordTouched, confirmPasswordTouched, setPasswordError])

    return (
      <Modal open={isOpen}>
        <ModalDialog>
          <Typography level='h4' mb={1}>
            Change Password
          </Typography>

          <Typography level='body-md' gutterBottom>
            Please enter your new password.
          </Typography>
          <FormControl>
            <Typography alignSelf={'start'}>
              New Password
            </Typography>
            <Input
              required
              fullWidth
              name='password'
              type='password'
              id='password'
              value={password}
              onChange={e => {
                setPasswordTouched(true)
                setPassword(e.target.value)
              }}
            />
          </FormControl>

          <FormControl>
            <Typography alignSelf={'start'}>
              Confirm Password
            </Typography>
            <Input
              required
              fullWidth
              name='confirmPassword'
              type='password'
              id='confirmPassword'
              value={confirmPassword}
              onChange={e => {
                setConfirmPasswordTouched(true)
                setConfirmPassword(e.target.value)
              }}
            />

            <FormHelperText>{passwordError}</FormHelperText>
          </FormControl>
          <Box display={'flex'} justifyContent={'space-around'} mt={1}>
            <Button
              disabled={passwordError != null}
              onClick={() => {
                onClose(password)
              }}
              fullWidth
              sx={{ mr: 1 }}
            >
              Change Password
            </Button>
            <Button
              onClick={() => {
                onClose(null)
              }}
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
