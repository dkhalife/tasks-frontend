import GoogleIcon from '@mui/icons-material/Google'
import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Input,
  Sheet,
  Snackbar,
  Typography,
} from '@mui/joy'
import React from 'react'
import { API_URL } from '../../Config'
import Logo from '../../Logo'
import { useNavigate } from 'react-router-dom'



const LoginSettings = () => {
  const [error, setError] = React.useState(null)
  const Navigate = useNavigate()
  
  const [serverURL, setServerURL] = React.useState('')

  const isValidServerURL = () => {
    return serverURL.match(/^(http|https):\/\/[^ "]+$/)
  }
  
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

        </Sheet>
      </Box>
      <Snackbar
        open={error !== null}
        onClose={() => setError(null)}
        autoHideDuration={3000}
        message={error}
      >
        {error}
      </Snackbar>
    </Container>
  )
}

export default LoginSettings
