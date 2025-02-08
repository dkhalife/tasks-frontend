import { Login } from '@/api/auth'
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
import Cookies from 'js-cookie'
import { goTo, goToMyTasks, goToRegister, goToResetPassword } from '@/utils/navigation'

type LoginViewProps = object

interface LoginViewState {
  username: string
  password: string
  error: string | null
}

export class LoginView extends React.Component<LoginViewProps, LoginViewState> {
  constructor(props: LoginViewProps) {
    super(props)

    this.state = {
      username: '',
      password: '',
      error: null,
    }
  }

  private handleSubmit = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

    const { username, password } = this.state

    try {
      const data = await Login(username, password)
      localStorage.setItem('ca_token', data.token)
      localStorage.setItem('ca_expiration', data.expiration)

      const redirectUrl = Cookies.get('ca_redirect')
      if (redirectUrl) {
        Cookies.remove('ca_redirect')
        goTo(redirectUrl)
      } else {
        goToMyTasks()
      }
    } catch (error) {
      this.setState({ error: (error as Error).message })
    }
  }

  private onEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ username: e.target.value })
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
              Username
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
