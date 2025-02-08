import React from 'react'

export class Logo extends React.Component {
  render() {
    return (
      <div>
        <img
          src={'./logo.svg'}
          alt='logo'
          width='128px'
          height='128px'
        />
      </div>
    )
  }
}
