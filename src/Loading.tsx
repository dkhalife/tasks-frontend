import { Box, CircularProgress, Container } from '@mui/joy'
import { Typography } from '@mui/material'
import { Logo } from './Logo'
import React from 'react'

type LoadingProps = object

interface LoadingState {
  subMessage: string
}

export class Loading extends React.Component<LoadingProps, LoadingState> {
  private timeout: number

  constructor(props){
    super(props)

    this.state = {
      subMessage: ''
    }
  }

  componentDidMount() {
    this.timeout = setTimeout(() => {
      this.setState({
        subMessage: 'This is taking longer than usual. There might be an issue.',
      })
    }, 5000)
  }

  componentWillUnmount() {
    clearTimeout(this.timeout)
  }

  render() {
    const { subMessage } = this.state

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
          <Typography fontWeight={500} textAlign={'center'}>
            {subMessage}
          </Typography>
        </Box>
      </Container>
    )
  }
}
