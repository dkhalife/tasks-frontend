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
import { useNavigate } from 'react-router-dom'
import Logo from '../../Logo'
import { login, signUp } from '../../utils/Fetcher'

const SignupView = () => {
  const [username, setUsername] = React.useState<string>('')
  const [password, setPassword] = React.useState<string>('')
  const navigate = useNavigate()
  const [displayName, setDisplayName] = React.useState<string>('')
  const [email, setEmail] = React.useState<string>('')
  const [usernameError, setUsernameError] = React.useState<string|null>(null)
  const [passwordError, setPasswordError] = React.useState<string|null>(null)
  const [emailError, setEmailError] = React.useState<string|null>(null)
  const [displayNameError, setDisplayNameError] = React.useState<string|null>(null)
  const [error, setError] = React.useState<string|null>(null)
  const handleLogin = (username, password) => {
    login(username, password).then(response => {
      if (response.status === 200) {
        response.json().then(res => {
          localStorage.setItem('ca_token', res.token)
          localStorage.setItem('ca_expiration', res.expire)
          navigate('/my/chores')
        })
      } else {
        alert('Login failed')
      }
    })
  }
  const handleSignUpValidation = () => {
    // Reset errors before validation
    setUsernameError(null)
    setPasswordError(null)
    setDisplayNameError(null)
    setEmailError(null)

    let isValid = true

    if (!username.trim()) {
      setUsernameError('Username is required')
      isValid = false
    }
    if (username.length < 4) {
      setUsernameError('Username must be at least 4 characters')
      isValid = false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Invalid email address')
      isValid = false
    }

    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      isValid = false
    }

    if (!displayName.trim()) {
      setDisplayNameError('Display name is required')
      isValid = false
    }

    // display name should only contain letters and spaces and numbers:
    if (!/^[a-zA-Z0-9 ]+$/.test(displayName)) {
      setDisplayNameError('Display name can only contain letters and numbers')
      isValid = false
    }

    // username should only contain letters , numbers , dot and dash:
    if (!/^[a-zA-Z0-9.-]+$/.test(username)) {
      setUsernameError(
        'Username can only contain letters, numbers, dot and dash',
      )
      isValid = false
    }

    return isValid
  }
  const handleSubmit = async e => {
    e.preventDefault()
    if (!handleSignUpValidation()) {
      return
    }
    signUp(username, password, displayName, email).then(response => {
      if (response.status === 201) {
        handleLogin(username, password)
      } else if (response.status === 403) {
        setError('Signup disabled, please contact admin')
      } else {
        alert('Signup failed')
        response.json().then(res => {
          setError(res.error)
        })
      }
    })
  }

  return (
    <Container component='main' maxWidth='xs'>
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
            // alignItems: 'center',
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
            <Typography level='body2'>
              Create an account to get started!
            </Typography>
          </Box>
          <Typography level='body2' alignSelf={'start'} mt={4}>
            Username
          </Typography>
          <Input
            margin='normal'
            required
            fullWidth
            id='username'
            label='Username'
            name='username'
            autoComplete='username'
            autoFocus
            value={username}
            onChange={e => {
              setUsernameError(null)
              setUsername(e.target.value.trim())
            }}
          />
          <FormControl error={usernameError}>
            <FormHelperText>{usernameError}</FormHelperText>
          </FormControl>
          {/* Error message display */}
          <Typography level='body2' alignSelf={'start'}>
            Email
          </Typography>
          <Input
            margin='normal'
            required
            fullWidth
            id='email'
            label='email'
            name='email'
            autoComplete='email'
            value={email}
            onChange={e => {
              setEmailError(null)
              setEmail(e.target.value.trim())
            }}
          />
          <FormControl error={emailError}>
            <FormHelperText>{emailError}</FormHelperText>
          </FormControl>
          <Typography level='body2' alignSelf={'start'}>
            Password:
          </Typography>
          <Input
            margin='normal'
            required
            fullWidth
            name='password'
            label='Password'
            type='password'
            id='password'
            value={password}
            onChange={e => {
              setPasswordError(null)
              setPassword(e.target.value)
            }}
          />
          <FormControl error={passwordError}>
            <FormHelperText>{passwordError}</FormHelperText>
          </FormControl>
          <Typography level='body2' alignSelf={'start'}>
            Display Name:
          </Typography>
          <Input
            margin='normal'
            required
            fullWidth
            name='displayName'
            label='Display Name'
            id='displayName'
            value={displayName}
            onChange={e => {
              setDisplayNameError(null)
              setDisplayName(e.target.value)
            }}
          />
          <FormControl error={displayNameError}>
            <FormHelperText>{displayNameError}</FormHelperText>
          </FormControl>
          <Button
            // type='submit'
            size='lg'
            fullWidth
            variant='solid'
            sx={{ mt: 3, mb: 1 }}
            onClick={handleSubmit}
          >
            Sign Up
          </Button>
          <Divider> or </Divider>
          <Button
            size='lg'
            onClick={() => {
              navigate('/login')
            }}
            fullWidth
            variant='soft'
            // sx={{ mt: 3, mb: 2 }}
          >
            Login
          </Button>
        </Sheet>
      </Box>
      <Snackbar
        open={error !== null}
        onClose={() => setError(null)}
        autoHideDuration={5000}
        message={error}
      >
        {error}
      </Snackbar>
    </Container>
  )
}

export default SignupView
