import { Login } from '@/api/auth'
import { withNavigation } from '@/contexts/hooks'
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

interface LoginViewProps {
  navigate: (path: string) => void
}

interface LoginViewState {
  username: string
  password: string
  error: string | null
}

class LoginViewInner extends React.Component<LoginViewProps, LoginViewState> {
  constructor(props: LoginViewProps) {
    super(props)

    this.state = {
      username: '',
      password: '',
      error: null,
    }
  }

  private handleForgotPassword = () => {
    this.props.navigate('/forgot-password')
  }

  private handleSubmit = async (e: MouseEvent) => {
    e.preventDefault()

    const { username, password } = this.state

    try {
      const data = await Login(username, password)
      localStorage.setItem('ca_token', data.token)
      localStorage.setItem('ca_expiration', data.expiration)

      const redirectUrl = Cookies.get('ca_redirect')
      if (redirectUrl) {
        Cookies.remove('ca_redirect')
        this.props.navigate(redirectUrl)
      } else {
        this.props.navigate('/my/tasks')
      }
    } catch (error) {
      this.setState({ error: (error as Error).message })
    }
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                this.setState({ username: e.target.value })
              }}
            />
            <Typography alignSelf={'start'}>Password:</Typography>
            <Input
              required
              fullWidth
              type='password'
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                this.setState({ password: e.target.value })
              }}
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
              onClick={this.handleForgotPassword}
            >
              Forgot password?
            </Button>

            <Divider> or </Divider>
            <Button
              onClick={() => {
                this.props.navigate('/signup')
              }}
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
          onClose={() => {
            this.setState({ error: null })
          }}
          autoHideDuration={3000}
        >
          {error}
        </Snackbar>
      </Container>
    )
  }
}

export const LoginView = withNavigation(LoginViewInner)
