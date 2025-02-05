import { ThemeMode } from "@/constants/theme"
import { retrieveValue, storeValue } from "@/utils/Storage"
import React from "react"

interface StorageContextProps {
  children: React.ReactNode
}

export type StorageContextState = {
  themeMode: ThemeMode
  setThemeMode: (themeMode: ThemeMode) => void
}

const initialThemeMode = retrieveValue<ThemeMode>('themeMode', 'system')

export const StorageContext = React.createContext<StorageContextState>({
  themeMode: initialThemeMode,
  setThemeMode: (themeMode: ThemeMode) => {
    storeValue('themeMode', themeMode)
  },
})

export class StorageContextProvider extends React.Component<
  StorageContextProps,
  StorageContextState
> {
  constructor(props: StorageContextProps) {
    super(props)
    this.state = {
      themeMode: initialThemeMode,
      setThemeMode: this.setThemeMode,
    }
  }

  private setThemeMode = (themeMode: ThemeMode) => {
    storeValue('themeMode', themeMode)
    this.setState({ themeMode })
  }

  render() {
    return (
      <StorageContext.Provider value={this.state}>
        {this.props.children}
      </StorageContext.Provider>
    )
  }
}
