import { Box, CircularProgress, Container } from '@mui/joy'
import { Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Logo } from '../../Logo'
import React from 'react'

export const LoadingComponent = () => {
  const [subMessage, setSubMessage] = useState('')
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSubMessage(
        'This is taking longer than usual. There might be an issue.',
      )
    }, 5000)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <Container className='flex h-full items-center justify-center'>
      <Box
        className='flex flex-col items-center justify-center'
        sx={{
          minHeight: '80vh',
        }}
      >
        <CircularProgress
          color='success'
          sx={{ '--CircularProgress-size': '200px' }}
        >
          <Logo />
        </CircularProgress>
        <Box
          className='flex items-center gap-2'
          sx={{
            fontWeight: 700,
            fontSize: 24,
            mt: 2,
          }}
        >
          Loading...
        </Box>
        <Typography level='h2' fontWeight={500} textAlign={'center'}>
          {subMessage}
        </Typography>
      </Box>
    </Container>
  )
}
