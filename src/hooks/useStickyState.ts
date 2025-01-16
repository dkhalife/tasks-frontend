import { useEffect, useState } from 'react'

export type StickyState = [string, (value: string) => void]

export const useStickyState = (defaultValue: string, key: string): StickyState => {
  const [value, setValue] = useState<string>(() => {
    const stickyValue = window.localStorage.getItem(key)
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue
  })

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}
