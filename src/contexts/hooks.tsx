import React from 'react'
import { Location, useLocation, useNavigate } from 'react-router-dom'

export function withLocation<Props>(
  Component: React.ComponentType<Props & { location: Location }>,
): (props: Props) => JSX.Element {
  return function impl(props) {
    return (
      <Component
        {...props}
        location={useLocation()}
      />
    )
  }
}

export function withNavigation<Props>(
  Component: React.ComponentType<Props & { navigate: (path: string) => void }>,
): (props: Props) => JSX.Element {
  return function impl(props) {
    return (
      <Component
        {...props as Props}
        navigate={useNavigate()}
      />
    )
  }
}
