import { Chip, Menu, MenuItem, Typography } from '@mui/joy'
import IconButton from '@mui/joy/IconButton'
import React, { useEffect, useRef, useState } from 'react'
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
  const [anchorEl, setAnchorEl] = useState(null)
  const menuRef = useRef(null)

  const handleMenuOpen = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleMenuOutsideClick = event => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      handleMenuClose()
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleMenuOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleMenuOutsideClick)
    }
  }, [anchorEl, handleMenuOutsideClick])

  return (
    <>
      <IconButton
        onClick={handleMenuOpen}
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
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
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
              handleMenuClose()
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
