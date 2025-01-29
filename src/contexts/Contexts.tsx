import React from 'react'
import { QueryContext } from './QueryContext'
import { RouterContext } from './RouterContext'
import { ThemeContext } from './ThemeContext'
import { StorageContextProvider } from './StorageContext'

export class Contexts extends React.Component {
  public render(): JSX.Element {
    return (
      <StorageContextProvider>
        <ThemeContext>
          <QueryContext>
            <RouterContext />
          </QueryContext>
        </ThemeContext>
      </StorageContextProvider>
    )
  }
}
