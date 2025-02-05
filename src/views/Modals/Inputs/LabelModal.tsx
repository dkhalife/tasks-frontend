import { UpdateLabel, CreateLabel } from "@/api/labels"
import { Label } from "@/models/label"
import { LABEL_COLORS } from "@/utils/Colors"
import { ModalDialog } from "@mui/joy"
import { Modal, Typography, FormControl, Input, Select, Box, Button } from "@mui/joy"
import React, { ChangeEvent } from "react"

interface LabelModalProps {
  label: Label | null

  onClose: () => void
}

interface LabelModalState {
  labelName: string
  color: string
  error: string
  isOpen: boolean
}

export class LabelModal extends React.Component<
  LabelModalProps,
  LabelModalState
> {
  constructor(props: LabelModalProps) {
    super(props)
    this.state = {
      labelName: '',
      color: '',
      error: '',
      isOpen: false,
    }
  }

  public open(): void {
    this.setState({ isOpen: true })
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

  private onSave = () => {
    if (!this.validateLabel()) {
      return
    }

    const { label } = this.props
    const { labelName, color } = this.state

    try {
      if (label) {
        UpdateLabel({ id: label.id, name: labelName, color })
      } else {
        CreateLabel({ name: labelName, color })
      }
      this.setState({ isOpen: false })
    } catch {
      this.setState({ error: 'Failed to save label. Please try again.' })
    }
  }

  private onCancel = () => {
    this.setState({ isOpen: false })
    this.props.onClose()
  }

  public render(): React.ReactNode {
    const { label } = this.props
    const { labelName, color, error, isOpen } = this.state

    return (
      <Modal
        open={isOpen}
        onClose={this.onCancel}
      >
        <ModalDialog>
          <Typography
            level='title-md'
            mb={1}
          >
            {label ? 'Edit Label' : 'Add Label'}
          </Typography>

          <FormControl>
            <Typography
              gutterBottom
              level='body-sm'
              alignSelf='start'
            >
              Name
            </Typography>
            <Input
              fullWidth
              id='labelName'
              value={labelName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => this.setState({ labelName: e.target.value })}
            />
          </FormControl>

          <FormControl>
            <Typography
              gutterBottom
              level='body-sm'
              alignSelf='start'
            >
              Color
            </Typography>
            <Select
              value={color}
              onChange={(_: ChangeEvent<HTMLSelectElement>, value: string) => {
                if (value) {
                  this.setState({ color: value })
                }
              }}
              required={true}
              defaultValue={color}
              renderValue={(selected: HTMLOptionElement | undefined) => (
                <Typography
                  startDecorator={
                    <span
                      className='size-4'
                      style={{
                        borderRadius: 10,
                        display: 'inline-block',
                        background: selected?.value,
                      }}
                    />
                  }
                >
                  {selected?.label}
                </Typography>
              )}
            >
              {LABEL_COLORS.map(val => (
                <Option
                  key={val.value}
                  value={val.value}
                >
                  <Box className='flex items-center justify-between'>
                    <Box
                      width={20}
                      height={20}
                      borderRadius={10}
                      sx={{ background: val.value }}
                    />
                    <Typography sx={{ ml: 1 }}>{val.name}</Typography>
                  </Box>
                </Option>
              ))}
            </Select>
          </FormControl>

          {error && (
            <Typography
              color='warning'
              level='body-sm'
            >
              {error}
            </Typography>
          )}

          <Box
            display='flex'
            justifyContent='space-around'
            mt={1}
          >
            <Button
              onClick={this.onSave}
              fullWidth
              sx={{ mr: 1 }}
            >
              {label ? 'Save Changes' : 'Add Label'}
            </Button>
            <Button
              onClick={this.onCancel}
              variant='outlined'
            >
              Cancel
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    )
  }
}
