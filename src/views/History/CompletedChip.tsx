import { CalendarViewDay, Check, Timelapse } from '@mui/icons-material'
import { Chip, ColorPaletteProp } from '@mui/joy'
import React, { ReactElement } from 'react'

interface CompletedChipProps {
  dueDate: Date
  completedAt: Date
}

export class CompletedChip extends React.Component<CompletedChipProps> {
  render(): React.ReactNode {
    const dueDate = this.props.dueDate.getTime()
    const completedAt = this.props.completedAt.getTime()

    let text = 'No Due Date'
    let color: ColorPaletteProp = 'neutral'
    let icon: ReactElement = <CalendarViewDay />
    // if completed few hours +-6 hours
    if (
      dueDate &&
      completedAt > dueDate - 1000 * 60 * 60 * 6 &&
      completedAt < dueDate + 1000 * 60 * 60 * 6
    ) {
      text = 'On Time'
      color = 'success'
      icon = <Check />
    } else if (
      dueDate &&
      completedAt < dueDate
    ) {
      text = 'On Time'
      color = 'success'
      icon = <Check />
    }

    // if completed after due date then it's late
    else if (
      dueDate &&
      completedAt > dueDate
    ) {
      text = 'Late'
      color = 'warning'
      icon = <Timelapse />
    }

    return (
      <Chip startDecorator={icon} color={color}>
        {text}
      </Chip>
    )
  }
}
