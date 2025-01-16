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
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { Logo } from '../../Logo'
import { ChangePassword } from '../../utils/Fetcher'
import React from 'react'

export class UpdatePasswordView extends React.Component {
  render(): React.ReactNode {
    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [passwordConfirm, setPasswordConfirm] = useState('')
    const [passwordError, setPasswordError] = useState<string | null>(null)
    const [passworConfirmationError, setPasswordConfirmationError] =
      useState<string | null>(null)
    const [searchParams] = useSearchParams()

    const [updateStatusOk, setUpdateStatusOk] = useState<boolean | null>(null)

    const verifiticationCode = searchParams.get('c')

    const handlePasswordChange = e => {
      const password = e.target.value
      setPassword(password)
      if (password.length < 8) {
        setPasswordError('Password must be at least 8 characters')
      } else {
        setPasswordError(null)
      }
    }
    const handlePasswordConfirmChange = e => {
      setPasswordConfirm(e.target.value)
      if (e.target.value !== password) {
        setPasswordConfirmationError('Passwords do not match')
      } else {
        setPasswordConfirmationError(null)
      }
    }

    const handleSubmit = async () => {
      if (passwordError != null || passworConfirmationError != null) {
        return
      }
      try {
        const response = await ChangePassword(verifiticationCode, password)

        if (response.ok) {
          setUpdateStatusOk(true)
          navigate('/login')
        } else {
          setUpdateStatusOk(false)
        }
      } catch {
        setUpdateStatusOk(false)
      }
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
                onChange={handlePasswordChange}
                error={passwordError !== null}
              />
              <FormHelperText>{passwordError}</FormHelperText>
            </FormControl>

            <FormControl error>
              <Input
                placeholder='Confirm Password'
                type='password'
                value={passwordConfirm}
                onChange={handlePasswordConfirmChange}
                error={passworConfirmationError !== null}
              />
              <FormHelperText>{passworConfirmationError}</FormHelperText>
            </FormControl>

            <Button
              fullWidth
              size='lg'
              sx={{
                mt: 5,
                mb: 1,
              }}
              onClick={handleSubmit}
            >
              Save Password
            </Button>
            <Button
              fullWidth
              size='lg'
              variant='soft'
              onClick={() => {
                navigate('/login')
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
            setUpdateStatusOk(null)
          }}
        >
          Password update failed, try again later
        </Snackbar>
      </Container>
    )
  }
}
