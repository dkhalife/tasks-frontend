import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export function withLocation<Props>(
  Component: React.ComponentType<Props>,
): (props: Omit<Props, 'location'>) => JSX.Element {
  return function impl(props: Omit<Props, 'location'>) {
    return (
      <Component
        {...props as Props}
        location={useLocation()}
      />
    )
  }
}

export function withNavigation<Props>(
  Component: React.ComponentType<Props>,
): (props: Omit<Props, 'navigate'>) => JSX.Element {
  return function impl(props: Omit<Props, 'navigate'>) {
    return (
      <Component
        {...props as Props}
        navigate={useNavigate()}
      />
    )
  }
}
