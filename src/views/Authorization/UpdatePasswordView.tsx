import {
  Box,
  Button,
  Container,
  FormControl,
  FormHelperText,
  Input,
  Sheet,
  Snackbar,
  Typography,
} from '@mui/joy'

import { Logo } from '../../Logo'
import React from 'react'
import { withNavigation } from '../../contexts/hooks'
import { validatePassword } from '../../models/user'
import { ChangePassword } from '../../api/auth'

interface UpdatePasswordViewProps {
  navigate: (path: string) => void
}

interface UpdatePasswordViewState {
  password: string
  passwordConfirm: string
  passwordError: string | null
  passwordConfirmationError: string | null
  updateStatusOk: boolean | null
}

class UpdatePasswordViewInner extends React.Component<
  UpdatePasswordViewProps,
  UpdatePasswordViewState
> {
  private handlePasswordChange = e => {
    const password = e.target.value

    if (!validatePassword(password)) {
      this.setState({
        password,
        passwordError: 'Password must be at least 8 characters',
      })
    } else {
      this.setState({
        password,
        passwordError: null,
      })
    }
  }

  private handlePasswordConfirmChange = e => {
    const { password } = this.state
    if (e.target.value !== password) {
      this.setState({
        passwordConfirm: e.target.value,
        passwordConfirmationError: 'Passwords do not match',
      })
    } else {
      this.setState({
        passwordConfirm: e.target.value,
        passwordConfirmationError: null,
      })
    }
  }

  private handleSubmit = async () => {
    const { navigate } = this.props
    const { password, passwordError, passwordConfirmationError } = this.state

    if (passwordError != null || passwordConfirmationError != null) {
      return
    }

    try {
      const verificationCode = new URLSearchParams(
        document.location.search,
      ).get('c') ?? ""

      if (await ChangePassword(verificationCode, password)) {
        this.setState({
          updateStatusOk: true,
        })
        navigate('/login')
      } else {
        this.setState({
          updateStatusOk: false,
        })
      }
    } catch {
      this.setState({
        updateStatusOk: false,
      })
    }
  }

  render(): React.ReactNode {
    const {
      password,
      passwordConfirm,
      passwordError,
      passwordConfirmationError,
      updateStatusOk,
    } = this.state

    return (
      <Container
        component='main'
        maxWidth='xs'
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: 4,
          }}
        >
          <Sheet
            component='form'
            sx={{
              mt: 1,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              padding: 2,
              borderRadius: '8px',
              boxShadow: 'md',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
              }}
            >
              <Logo />
              <Typography level='h2'>
                Done
                <span
                  style={{
                    color: '#06b6d4',
                  }}
                >
                  tick
                </span>
              </Typography>
              <Typography mb={4}>
                Please enter your new password below
              </Typography>
            </Box>

            <FormControl error>
              <Input
                placeholder='Password'
                type='password'
                value={password}
                onChange={this.handlePasswordChange}
                error={passwordError !== null}
              />
              <FormHelperText>{passwordError}</FormHelperText>
            </FormControl>

            <FormControl error>
              <Input
                placeholder='Confirm Password'
                type='password'
                value={passwordConfirm}
                onChange={this.handlePasswordConfirmChange}
                error={passwordConfirmationError !== null}
              />
              <FormHelperText>{passwordConfirmationError}</FormHelperText>
            </FormControl>

            <Button
              fullWidth
              size='lg'
              sx={{
                mt: 5,
                mb: 1,
              }}
              onClick={this.handleSubmit}
            >
              Save Password
            </Button>
            <Button
              fullWidth
              size='lg'
              variant='soft'
              onClick={() => {
                this.props.navigate('/login')
              }}
            >
              Cancel
            </Button>
          </Sheet>
        </Box>
        <Snackbar
          open={updateStatusOk !== true}
          autoHideDuration={6000}
          onClose={() => {
            this.setState({ updateStatusOk: null })
          }}
        >
          Password update failed, try again later
        </Snackbar>
      </Container>
    )
  }
}

export const UpdatePasswordView = withNavigation(UpdatePasswordViewInner)
