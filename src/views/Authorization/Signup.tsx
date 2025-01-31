import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormHelperText,
  Input,
  Sheet,
  Snackbar,
  Typography,
} from '@mui/joy'
import React from 'react'
import { Logo } from '../../Logo'
import { login, signUp } from '../../utils/Fetcher'
import { withNavigation } from '../../contexts/hooks'
import { validateEmail, validatePassword } from '../../models/user'

interface SignupViewProps {
  navigate: (path: string) => void
}

interface SignupViewState {
  username: string
  password: string
  displayName: string
  email: string
  usernameError: string | null
  passwordError: string | null
  emailError: string | null
  displayNameError: string | null
  error: string | null
}

class SignupViewInner extends React.Component<
  SignupViewProps,
  SignupViewState
> {
  constructor(props: SignupViewProps) {
    super(props)

    this.state = {
      username: '',
      password: '',
      displayName: '',
      email: '',
      usernameError: null,
      passwordError: null,
      emailError: null,
      displayNameError: null,
      error: null,
    }
  }

  private handleLogin = (username, password) => {
    login(username, password).then(response => {
      if (response.status === 200) {
        response.json().then(res => {
          localStorage.setItem('ca_token', res.token)
          localStorage.setItem('ca_expiration', res.expire)
          this.props.navigate('/my/chores')
        })
      } else {
        this.setState({ error: 'Login failed' })
      }
    })
  }

  private handleSignUpValidation = () => {
    // Reset errors before validation
    const newState: SignupViewState = {
      ...this.state,
      usernameError: null,
      passwordError: null,
      displayNameError: null,
      emailError: null,
    }

    const { username, password, displayName, email } = this.state

    let isValid = true

    if (!username.trim()) {
      newState.usernameError = 'Username is required'
      isValid = false
    }
    if (username.length < 4) {
      newState.usernameError = 'Username must be at least 4 characters'
      isValid = false
    }
    if (!validateEmail(email)) {
      newState.emailError = 'Invalid email address'
      isValid = false
    }

    if (!validatePassword(password)) {
      newState.passwordError = 'Password must be at least 8 characters'
      isValid = false
    }

    if (!displayName.trim()) {
      newState.displayNameError = 'Display name is required'
      isValid = false
    }

    // display name should only contain letters and spaces and numbers:
    if (!/^[a-zA-Z0-9 ]+$/.test(displayName)) {
      newState.displayNameError =
        'Display name can only contain letters, numbers and spaces'
      isValid = false
    }

    // username should only contain letters , numbers , dot and dash:
    if (!/^[a-zA-Z0-9.-]+$/.test(username)) {
      newState.usernameError =
        'Username can only contain letters, numbers, dot and dash'
      isValid = false
    }

    this.setState(newState)
    return isValid
  }

  private handleSubmit = async e => {
    e.preventDefault()

    if (!this.handleSignUpValidation()) {
      return
    }

    const { username, password, displayName, email } = this.state
    signUp(username, password, displayName, email).then(response => {
      if (response.status === 201) {
        this.handleLogin(username, password)
      } else if (response.status === 403) {
        this.setState({ error: 'Signup disabled, please contact admin' })
      } else {
        response.json().then(res => {
          this.setState({ error: res.error })
        })
      }
    })
  }

  render(): React.ReactNode {
    const {
      username,
      password,
      displayName,
      email,
      usernameError,
      passwordError,
      displayNameError,
      emailError,
      error,
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
              <Typography>Create an account to get started!</Typography>
            </Box>
            <Typography
              alignSelf={'start'}
              mt={4}
            >
              Username
            </Typography>
            <Input
              required
              fullWidth
              id='username'
              name='username'
              autoComplete='username'
              autoFocus
              value={username}
              onChange={e => {
                this.setState({
                  usernameError: null,
                  username: e.target.value.trim(),
                })
              }}
            />
            <FormControl>
              <FormHelperText>{usernameError}</FormHelperText>
            </FormControl>
            <Typography alignSelf={'start'}>Email</Typography>
            <Input
              required
              fullWidth
              id='email'
              name='email'
              autoComplete='email'
              value={email}
              onChange={e => {
                this.setState({
                  emailError: null,
                  email: e.target.value.trim(),
                })
              }}
            />
            <FormControl>
              <FormHelperText>{emailError}</FormHelperText>
            </FormControl>
            <Typography alignSelf={'start'}>Password:</Typography>
            <Input
              required
              fullWidth
              name='password'
              type='password'
              id='password'
              value={password}
              onChange={e => {
                this.setState({ passwordError: null, password: e.target.value })
              }}
            />
            <FormControl>
              <FormHelperText>{passwordError}</FormHelperText>
            </FormControl>
            <Typography alignSelf={'start'}>Display Name:</Typography>
            <Input
              required
              fullWidth
              name='displayName'
              id='displayName'
              value={displayName}
              onChange={e => {
                this.setState({
                  displayNameError: null,
                  displayName: e.target.value.trim(),
                })
              }}
            />
            <FormControl>
              <FormHelperText>{displayNameError}</FormHelperText>
            </FormControl>
            <Button
              size='lg'
              fullWidth
              variant='solid'
              sx={{ mt: 3, mb: 1 }}
              onClick={this.handleSubmit}
            >
              Sign Up
            </Button>
            <Divider> or </Divider>
            <Button
              size='lg'
              onClick={() => {
                this.props.navigate('/login')
              }}
              fullWidth
              variant='soft'
            >
              Login
            </Button>
          </Sheet>
        </Box>
        <Snackbar
          open={error !== null}
          onClose={() => this.setState({ error: null })}
          autoHideDuration={5000}
        >
          {error}
        </Snackbar>
      </Container>
    )
  }
}

export const SignupView = withNavigation(SignupViewInner)
