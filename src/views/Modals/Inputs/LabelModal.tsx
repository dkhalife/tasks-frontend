import { UpdateLabel, CreateLabel } from '@/api/labels'
import { Label } from '@/models/label'
import { LABEL_COLORS } from '@/utils/Colors'
import { ModalDialog } from '@mui/joy'
import {
  Modal,
  Typography,
  FormControl,
  Input,
  Select,
  Box,
  Button,
  Option,
} from '@mui/joy'
import React, { ChangeEvent } from 'react'
import { SelectValue } from '@mui/base/useSelect/useSelect.types'
import { ColorOption } from '@/utils/labels'

interface LabelModalProps {
  id: string | undefined
  name: string | undefined
  color: ColorOption | undefined

  onClose: (label: Label | null) => void
}

interface LabelModalState {
  labelName: string
  color: ColorOption | undefined
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
      labelName: props.name ?? '',
      color: props.color,
      error: '',
      isOpen: false,
    }
  }

  componentDidUpdate(prevProps: Readonly<LabelModalProps>): void {
    if (this.props.name !== prevProps.name || this.props.color !== prevProps.color || this.props.id !== prevProps.id) {
      this.setState({
        labelName: this.props.name ?? '',
        color: this.props.color,
        error: '',
      })
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

  private onSave = async () => {
    const { labelName, color } = this.state

    if (!this.validateLabel() || !color) {
      return
    }

    const { id } = this.props
    let newLabel: Label | null = null
    if (id) {
      try {
        newLabel = (await UpdateLabel({
          id: id,
          name: labelName,
          color: color.value,
        })).label
      } catch {
        this.setState({ error: 'Failed to save label. Please try again.' })
      }
    } else {
      try {
        newLabel = (await CreateLabel({
          name: labelName,
          color: color.value,
        })).label
      } catch {
        this.setState({ error: 'Failed to create label. Please try again.' })
      }
    }

    this.props.onClose(newLabel)
    this.setState({ isOpen: false })
  }

  private onCancel = () => {
    this.props.onClose(null)
    this.setState({ isOpen: false })
  }

  private onLabelNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ labelName: e.target.value })
  }

  private onColorChange = (e: React.MouseEvent | React.KeyboardEvent | React.FocusEvent | null, value: SelectValue<ColorOption, false>) => {
    if (value) {
      this.setState({ color: value })
    } 
  }

  public render(): React.ReactNode {
    const { id } = this.props
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
            {id ? 'Edit Label' : 'Add Label'}
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
              defaultValue={labelName}
              onChange={this.onLabelNameChange}
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
              onChange={this.onColorChange}
              required={true}
              defaultValue={color}
              startDecorator={
                <span
                  style={{
                    borderRadius: 10,
                    display: 'inline-block',
                    background: color?.value,
                    width: '20px',
                    height: '20px',
                  }}
                />
              }
            >
              {LABEL_COLORS.map(val => (
                <Option
                  key={val.value}
                  value={val.value}
                >
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
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
              {id ? 'Save Changes' : 'Add Label'}
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
