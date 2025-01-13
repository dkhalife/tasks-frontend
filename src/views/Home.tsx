import { Box, Button, Container, Typography } from '@mui/joy'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import Logo from '../Logo'
import React from 'react'
const Home = () => {
  const navigate = useNavigate()

  return (
    <Container className='flex h-full items-center justify-center'>
      <Box className='flex flex-col items-center justify-center'>
        <Logo />
        <Typography level='h1'>
          Done
          <span
            style={{
              color: '#06b6d4',
            }}
          >
            tick
          </span>
        </Typography>
      </Box>
      <Box className='flex flex-col items-center justify-center' mt={10}>
        <Button
          sx={{ mt: 1 }}
          onClick={() => {
            navigate('/my/chores')
          }}
        >
          Get Started!
        </Button>
      </Box>
    </Container>
  )
}

export default Home
