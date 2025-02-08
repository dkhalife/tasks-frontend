import { Login, SignUp } from '@/api/auth'
import { Logo } from '@/Logo'
import { validateEmail, validatePassword } from '@/models/user'
import { goToLogin, goToMyTasks } from '@/utils/navigation'
import {
  Container,
  Box,
  Typography,
  Input,
  FormControl,
  FormHelperText,
  Button,
  Sheet,
  Divider,
  Snackbar,
} from '@mui/joy'
import React, { ChangeEvent } from 'react'

type SignupViewProps = object

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

export class SignupView extends React.Component<
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

  private handleLogin = async (username: string, password: string) => {
    try {
      const data = await Login(username, password)
      localStorage.setItem('ca_token', data.token)
      localStorage.setItem('ca_expiration', data.expiration)
      goToMyTasks()
    } catch {
      this.setState({ error: 'Login failed' })
    }
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

  private handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault()

    if (!this.handleSignUpValidation()) {
      return
    }

    const { username, password, displayName, email } = this.state
    try {
      await SignUp(username, password, displayName, email)
      this.handleLogin(username, password)
    } catch (error) {
      this.setState({ error: (error as Error).message })
    }
  }

  private onUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      usernameError: null,
      username: e.target.value.trim(),
    })
  }

  private onEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      emailError: null,
      email: e.target.value.trim(),
    })
  }

  private onPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      passwordError: null,
      password: e.target.value
    })
  }

  private onDisplayNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      displayNameError: null,
      displayName: e.target.value.trim(),
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
              autoComplete='username'
              autoFocus
              value={username}
              onChange={this.onUsernameChange}
            />
            <FormControl>
              <FormHelperText>{usernameError}</FormHelperText>
            </FormControl>
            <Typography alignSelf={'start'}>Email</Typography>
            <Input
              required
              fullWidth
              autoComplete='email'
              value={email}
              onChange={this.onEmailChange}
            />
            <FormControl>
              <FormHelperText>{emailError}</FormHelperText>
            </FormControl>
            <Typography alignSelf={'start'}>Password:</Typography>
            <Input
              required
              fullWidth
              type='password'
              value={password}
              onChange={this.onPasswordChange}
            />
            <FormControl>
              <FormHelperText>{passwordError}</FormHelperText>
            </FormControl>
            <Typography alignSelf={'start'}>Display Name:</Typography>
            <Input
              required
              fullWidth
              value={displayName}
              onChange={this.onDisplayNameChange}
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
              onClick={goToLogin}
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
