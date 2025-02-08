import { Typography } from '@mui/joy'
import React from 'react'

export class NotFound extends React.Component {
  render(): React.ReactNode {
    return (
      <div className='grid min-h-screen place-items-center'>
        <Typography level='h1'>404</Typography>
      </div>
    )
  }
}
