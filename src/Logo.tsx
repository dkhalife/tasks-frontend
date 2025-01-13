import LogoSVG from '@/assets/logo.svg'
import React from 'react'

const Logo = () => {
  return (
    <div className='logo'>
      <img src={LogoSVG} alt='logo' width='128px' height='128px' />
    </div>
  )
}
export default Logo
