import { ResetPassword } from '@/api/auth'
import { validateEmail } from '@/models/user'
import { goToLogin } from '@/utils/navigation'
import { Sheet } from '@mui/joy'
import {
  Container,
  Box,
  Typography,
  FormControl,
  Input,
  FormHelperText,
  Button,
  Snackbar,
} from '@mui/joy'
import React, { ChangeEvent } from 'react'

type ForgotPasswordViewProps = object

interface ForgotPasswordViewState {
  email: string
  emailError: string | null
  resetStatusOk: boolean | null
}

export class ForgotPasswordView extends React.Component<
  ForgotPasswordViewProps,
  ForgotPasswordViewState
> {
  constructor(props: ForgotPasswordViewProps) {
    super(props)

    this.state = {
      email: '',
      emailError: null,
      resetStatusOk: null,
    }
  }

  private handleSubmit = async () => {
    if (!this.state.email) {
      this.setState({ emailError: 'Email is required' })
      return
    }

    if (!validateEmail(this.state.email)) {
      this.setState({ emailError: 'Please enter a valid email address' })
      return
    }

    try {
      await ResetPassword(this.state.email)
      this.setState({ resetStatusOk: true })
    } catch {
      this.setState({ resetStatusOk: false })
    }
  }

  private handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ email: e.target.value })
  }

  private onEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') {
      return
    }

    e.preventDefault()
    this.handleSubmit()
  }

  private onSnackbarClose = () => {
    const { resetStatusOk } = this.state
    if (resetStatusOk) {
      goToLogin()
    }
  }

  render(): React.ReactNode {
    const { email, emailError, resetStatusOk } = this.state

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
            justifyContent: 'space-between',
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
              minHeight: '450px',
              justifyContent: 'space-between',
              justifyItems: 'center',
            }}
          >
            <Box>
              <img
                src={'./logo.svg'}
                alt='logo'
                width='128px'
                height='128px'
              />
              <Typography level='h2'>
                Tasks
                <span
                  style={{
                    color: '#06b6d4',
                  }}
                >
                  Exp
                </span>
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center' }}></Box>
            {resetStatusOk === null && (
              <FormControl
                error={emailError !== null}
                onSubmit={this.handleSubmit}
              >
                <div
                  style={{
                    display: 'grid',
                    gap: 6,
                  }}
                >
                  <Typography>
                    Enter your email, and we&lsquo;ll send you a link to get
                    into your account.
                  </Typography>
                  <Input
                    placeholder='Email'
                    type='email'
                    variant='soft'
                    fullWidth
                    value={email}
                    onChange={this.handleEmailChange}
                    error={emailError !== null}
                    onKeyDown={this.onEmailKeyDown}
                  />
                  <FormHelperText>{emailError}</FormHelperText>
                  <Box>
                    <Button
                      variant='solid'
                      size='lg'
                      fullWidth
                      sx={{
                        mb: 1,
                      }}
                      onClick={this.handleSubmit}
                    >
                      Reset Password
                    </Button>
                    <Button
                      fullWidth
                      size='lg'
                      variant='soft'
                      sx={{
                        width: '100%',
                        border: 'moccasin',
                        borderRadius: '8px',
                      }}
                      onClick={goToLogin}
                      color='neutral'
                    >
                      Back to Login
                    </Button>
                  </Box>
                </div>
              </FormControl>
            )}
            {resetStatusOk != null && (
              <>
                <Box mt={-30}>
                  <Typography>
                    if there is an account associated with the email you
                    entered, you will receive an email with instructions on how
                    to reset your
                  </Typography>
                </Box>
                <Button
                  variant='soft'
                  size='lg'
                  sx={{ position: 'relative', bottom: '0' }}
                  onClick={goToLogin}
                  fullWidth
                >
                  Go to Login
                </Button>
              </>
            )}
            <Snackbar
              open={resetStatusOk ? resetStatusOk : resetStatusOk === false}
              autoHideDuration={5000}
              onClose={this.onSnackbarClose}
             >
              {resetStatusOk ? 'Reset email sent, check your email' : 'Reset email failed, try again later'}
            </Snackbar>
          </Sheet>
        </Box>
      </Container>
    )
  }
}
