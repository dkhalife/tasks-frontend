import {
  Box,
  Button,
  FormControl,
  Input,
  Modal,
  ModalDialog,
  Option,
  Select,
  Typography,
} from '@mui/joy'

import { useQueryClient } from 'react-query'
import { LABEL_COLORS } from '../../../utils/Colors'
import { CreateLabel, UpdateLabel } from '../../../utils/Fetcher'
import React from 'react'

interface LabelModalProps {
  isOpen: boolean,
  onClose: () => void,
  label: any
}

interface LabelModalState {
  labelName: string,
  color: string,
  error: string
}

export class LabelModal extends React.Component<LabelModalProps, LabelModalState> {
  constructor(props: LabelModalProps) {
    super(props)
    this.state = {
      labelName: '',
      color: '',
      error: ''
    }
  }

  private validateLabel = () => {
    const { labelName, color } = this.state

    if (!labelName.trim()) {
      this.setState({ error: 'Name cannot be empty' })
      return false
    }
  
    // TODO: Use local cache instead of fetching from server
    /*const { data: userLabels = [] } = useLabels()
    if (
      userLabels.some(
        userLabel => userLabel.name === labelName && userLabel.id !== this.props.label?.id,
      )
    ) {
      this.setState({ error: 'Label with this name already exists' })
      return false
    }*/

    if (!color) {
      this.setState({ error: 'Please select a color' })
      return false
    }

    return true
  }
  
  private handleSave = () => {
    if (!this.validateLabel()) {
      return
    }

    const { label } = this.props
    const { labelName, color } = this.state
    // TODO: With the cache, invalidate here
    try {
      if (label) {
        UpdateLabel({ id: label.id, name: labelName, color })
      }
      else {
        CreateLabel({ name: labelName, color })
      }
    } catch {
      this.setState({ error: 'Failed to save label. Please try again.' })
    }
  }

  public render(): React.ReactNode {
    const { isOpen, onClose, label } = this.props
  const { labelName, color, error } = this.state

    return (
      <Modal open={isOpen} onClose={onClose}>
        <ModalDialog>
          <Typography level='title-md' mb={1}>
            {label ? 'Edit Label' : 'Add Label'}
          </Typography>

          <FormControl>
            <Typography gutterBottom level='body-sm' alignSelf='start'>
              Name
            </Typography>
            <Input
              fullWidth
              id='labelName'
              value={labelName}
              onChange={e => this.setState({ labelName: e.target.value })}
            />
          </FormControl>

          <FormControl>
            <Typography gutterBottom level='body-sm' alignSelf='start'>
              Color
            </Typography>
            <Select
              value={color}
              onChange={(e, value) => {
                 if (value){
                  this.setState({ color: value })
                }
              }}
              required={true}
              defaultValue={color}
              renderValue={selected => (
                <Typography
                  startDecorator={
                    <span
                      className='size-4'
                      style={{
                        borderRadius: 10,
                        display: 'inline-block',
                        background: selected?.value
                      }}
                    />
                  }
                >
                  {selected?.label}
                </Typography>
              )}
            >
              {LABEL_COLORS.map(val => (
                <Option key={val.value} value={val.value}>
                  <Box className='flex items-center justify-between'>
                    <Box
                      width={20}
                      height={20}
                      borderRadius={10}
                      sx={{ background: val.value }}
                    />
                    <Typography sx={{ ml: 1 }}>
                      {val.name}
                    </Typography>
                  </Box>
                </Option>
              ))}
            </Select>
          </FormControl>

          {error && (
            <Typography color='warning' level='body-sm'>
              {error}
            </Typography>
          )}

          <Box display='flex' justifyContent='space-around' mt={1}>
            <Button onClick={this.handleSave} fullWidth sx={{ mr: 1 }}>
              {label ? 'Save Changes' : 'Add Label'}
            </Button>
            <Button onClick={onClose} variant='outlined'>
              Cancel
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    )
  }
}
