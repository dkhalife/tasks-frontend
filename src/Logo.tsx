import LogoSVG from './assets/logo.svg'
import React from 'react'

export const Logo = () => {
  return (
    <div>
      <img src={LogoSVG} alt='logo' width='128px' height='128px' />
    </div>
  )
}
