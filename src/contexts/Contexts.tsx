import React from 'react'
import { RouterContext } from './RouterContext'
import { ThemeContextProvider } from './ThemeContext'

export class Contexts extends React.Component {
  public render(): JSX.Element {
    return (
      <ThemeContextProvider>
        <RouterContext />
      </ThemeContextProvider>
    )
  }
}
