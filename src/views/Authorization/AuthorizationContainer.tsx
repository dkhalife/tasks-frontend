import { Box, Paper } from '@mui/material'
import { styled } from '@mui/material/styles'
import React from 'react'

const Container = styled('div')(({ theme }) => ({
  minHeight: '100vh',
  padding: '24px',
  display: 'grid',
  placeItems: 'start center',
  [theme.breakpoints.up('sm')]: {
    placeItems: 'center',
  },
}))

const AuthCard = styled(Paper)(({ theme }) => ({
  padding: 24,
  paddingTop: 32,
  borderRadius: 24,
  width: '100%',
  maxWidth: '400px',
  [theme.breakpoints.down('sm')]: {
    maxWidth: 'unset',
  },
}))

export function AuthCardContainer({ children }) {
  return (
    <Container>
      <AuthCard elevation={0}>
        <Box
          sx={{
            display: 'grid',
            placeItems: 'center',
            paddingBottom: 4,
          }}
        >
        </Box>
        {children}
      </AuthCard>
    </Container>
  )
}
