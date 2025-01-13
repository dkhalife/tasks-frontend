import React from 'react'
import { QueryContext } from './QueryContext'
import { RouterContext } from './RouterContext'
import { ThemeContext } from './ThemeContext'

export const Contexts = () => {
  const contexts = [ThemeContext, QueryContext, RouterContext]

  return contexts.reduceRight((acc, Context) => {
    return <Context>{acc}</Context>
  }, {})
}
