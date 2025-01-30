import LogoSVG from './assets/logo.svg'
import React, { Component } from 'react'

export class Logo extends Component {
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
