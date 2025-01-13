import { Chip, Menu, MenuItem, Typography } from '@mui/joy'
import IconButton from '@mui/joy/IconButton'
import React, { useRef } from 'react'
import { getTextColorFromBackgroundColor } from '../../utils/Colors'

const IconButtonWithMenu = ({
  key,
  icon,
  options,
  onItemSelect,
  setSelectedItem,
  isActive,
  useChips,
  title,
}) => {
  const menuRef = useRef(null)

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
        key={key}
        ref={menuRef}
      >
        {title && (
          <MenuItem key={`${key}-title`} disabled>
            <Typography level='body-sm' sx={{ fontWeight: 'bold' }}>
              {title}
            </Typography>
          </MenuItem>
        )}
        {options?.map(item => (
          <MenuItem
            key={`${key}-${item?.id}`}
            onClick={() => {
              onItemSelect(item)
              setSelectedItem?.selectedItem(item.name)
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
export default IconButtonWithMenu
