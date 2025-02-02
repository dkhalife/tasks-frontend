import LogoSVG from './assets/logo.svg'
import React from 'react'

export class Logo extends React.Component {
  render() {
    return (
      <div>
        <img
          src={LogoSVG}
          alt='logo'
          width='128px'
          height='128px'
        />
      </div>
    )
  }
}
