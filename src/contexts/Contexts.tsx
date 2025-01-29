import React from 'react'
import { RouterContext } from './RouterContext'
import { ThemeContext } from './ThemeContext'
import { StorageContextProvider } from './StorageContext'

export class Contexts extends React.Component {
  public render(): JSX.Element {
    return (
      <StorageContextProvider>
        <ThemeContext>
          <RouterContext />
        </ThemeContext>
      </StorageContextProvider>
    )
  }
}
