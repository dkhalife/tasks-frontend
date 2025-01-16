import React from 'react'
import { QueryContext } from './QueryContext'
import { RouterContext } from './RouterContext'
import { ThemeContext } from './ThemeContext'

export class Contexts extends React.Component {
  public render(): JSX.Element {
    return (
      <ThemeContext>
        <QueryContext>
          <RouterContext />
        </QueryContext>
      </ThemeContext>
    )
  }
}
