import { Logo } from '@/Logo'
import { Sheet } from '@mui/joy'
import {
  Container,
  Box,
  Typography,
  Input,
  Button,
  Divider,
  Snackbar,
} from '@mui/joy'
import React, { ChangeEvent } from 'react'
import { goToRegister, goToResetPassword } from '@/utils/navigation'
import { doLogin } from '@/utils/auth'

type LoginViewProps = object

interface LoginViewState {
  email: string
  password: string
  error: string | null
}

export class LoginView extends React.Component<LoginViewProps, LoginViewState> {
  constructor(props: LoginViewProps) {
    super(props)

    this.state = {
      email: '',
      password: '',
      error: null,
    }
  }

  private handleSubmit = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

    try {
      const { email, password } = this.state
      doLogin(email, password)
    } catch (error) {
      this.setState({ error: (error as Error).message })
    }
  }

  private onEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ email: e.target.value })
  }

  private onPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ password: e.target.value })
  }

  private onSnackbarClose = () => {
    this.setState({ error: null })
  }

  render(): React.ReactNode {
    const { error } = this.state

    return (
      <Container
        component='main'
        maxWidth='xs'
      >
        <Box
          sx={{
            marginTop: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Sheet
            component='form'
            sx={{
              mt: 1,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: 2,
              borderRadius: '8px',
              boxShadow: 'md',
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

            <Typography>Sign in to your account to continue</Typography>
            <Typography
              alignSelf={'start'}
              mt={4}
            >
              Email
            </Typography>
            <Input
              required
              fullWidth
              autoComplete='email'
              autoFocus
              onChange={this.onEmailChange}
            />
            <Typography alignSelf={'start'}>Password:</Typography>
            <Input
              required
              fullWidth
              type='password'
              onChange={this.onPasswordChange}
            />

            <Button
              type='submit'
              fullWidth
              size='lg'
              variant='solid'
              sx={{
                width: '100%',
                mt: 3,
                border: 'moccasin',
                borderRadius: '8px',
              }}
              onClick={this.handleSubmit}
            >
              Sign In
            </Button>
            <Button
              type='submit'
              fullWidth
              size='lg'
              variant='plain'
              sx={{
                width: '100%',
                border: 'moccasin',
                borderRadius: '8px',
              }}
              onClick={goToResetPassword}
            >
              Forgot password?
            </Button>

            <Divider> or </Divider>
            <Button
              onClick={goToRegister}
              fullWidth
              variant='soft'
              size='lg'
              sx={{
                mt: 2,
              }}
            >
              Create new account
            </Button>
          </Sheet>
        </Box>
        <Snackbar
          open={error !== null}
          onClose={this.onSnackbarClose}
          autoHideDuration={3000}
        >
          {error}
        </Snackbar>
      </Container>
    )
  }
}
