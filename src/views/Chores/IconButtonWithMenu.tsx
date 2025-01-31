import { Chip, Menu, MenuItem, Typography } from '@mui/joy'
import IconButton from '@mui/joy/IconButton'
import React from 'react'
import { getTextColorFromBackgroundColor } from '../../utils/Colors'

interface Option {
  name: string
  value: string
  color?: string
  icon?: React.ReactNode
}

interface IconButtonWithMenuProps {
  keyName: string
  icon: string
  options: Option[]
  onItemSelect: (item: Option) => void
  isActive: boolean
  useChips: boolean
  title: string
}

export class IconButtonWithMenu extends React.Component<IconButtonWithMenuProps> {
  private menuRef = React.createRef<HTMLDivElement>()

  render(): React.ReactNode {
    const {
      keyName,
      icon,
      options,
      onItemSelect,
      isActive,
      useChips,
      title,
    } = this.props

    return (
      <>
        <IconButton
          variant='outlined'
          color={isActive ? 'primary' : 'neutral'}
          size='sm'
          sx={{
            height: 24,
            borderRadius: 24,
          }}
        >
          {icon}
        </IconButton>

        <Menu
          key={keyName}
          ref={this.menuRef}
        >
          {title && (
            <MenuItem
              key={`${keyName}-title`}
              disabled
            >
              <Typography
                level='body-sm'
                sx={{ fontWeight: 'bold' }}
              >
                {title}
              </Typography>
            </MenuItem>
          )}
          {options?.map(item => (
            <MenuItem
              key={`${keyName}-${item.value}`}
              onClick={() => {
                onItemSelect(item)
              }}
            >
              {useChips ? (
                <Chip
                  sx={{
                    backgroundColor: item.color ? item.color : null,
                    color: getTextColorFromBackgroundColor(item.color),
                  }}
                >
                  {item.name}
                </Chip>
              ) : (
                <>
                  {item?.icon}
                  {item.name}
                </>
              )}
            </MenuItem>
          ))}
        </Menu>
      </>
    )
  }
}
