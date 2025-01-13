import {
  ListItem,
  ListItemButton,
  ListItemContent,
  ListItemDecorator,
} from '@mui/joy'
import React from 'react'
import { Link } from 'react-router-dom'

export const NavBarLink = ({ link }) => {
  const { to, icon, label } = link
  return (
    <ListItem>
      <ListItemButton
        key={to}
        component={Link}
        to={to}
        variant='plain'
        color='neutral'
        sx={{
          borderRadius: 4,
          py: 1.2,
        }}
      >
        <ListItemDecorator>{icon}</ListItemDecorator>
        <ListItemContent>{label}</ListItemContent>
      </ListItemButton>
    </ListItem>
  )
}
