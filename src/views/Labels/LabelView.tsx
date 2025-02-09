import { DeleteLabel, GetLabels } from '@/api/labels'
import { Label } from '@/models/label'
import { getTextColorFromBackgroundColor } from '@/utils/Colors'
import { Add } from '@mui/icons-material'
import {
  Box,
  CircularProgress,
  Typography,
  Container,
  Chip,
  Button,
  IconButton,
} from '@mui/joy'
import React from 'react'
import { LabelModal } from '../Modals/Inputs/LabelModal'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'

type LabelViewProps = object

interface LabelViewState {
  isLabelsLoading: boolean
  userLabels: Label[]
  currentLabel: Label | null
  isError: boolean
}

export class LabelView extends React.Component<LabelViewProps, LabelViewState> {
  private modalRef = React.createRef<LabelModal>()

  constructor(props: LabelViewProps) {
    super(props)

    this.state = {
      isLabelsLoading: true,
      userLabels: [],
      currentLabel: null,
      isError: false,
    }
  }

  private handleAddLabel = () => {
    this.setState({
      currentLabel: null,
    })

    this.modalRef.current?.open()
  }

  private handleEditLabel = (label: Label) => {
    this.setState({
      currentLabel: label,
    })

    this.modalRef.current?.open()
  }

  private handleDeleteLabel = async (id: string) => {
    await DeleteLabel(id)
    const { userLabels } = this.state
    const updatedLabels = userLabels.filter(label => label.id !== id)

    this.setState({ userLabels: updatedLabels })
  }

  private loadLabels = async() => {
    try {
      const data = await GetLabels()
      this.setState({
        userLabels: data.labels,
        isLabelsLoading: false,
      })
    } catch {
      this.setState({
        isLabelsLoading: false,
        isError: true,
      })
    }
  }

  private onLabelModalClose = (newLabel: Label | null) => {
    if (!newLabel) {
      // No creation or update was made
      return
    }

    const { userLabels, currentLabel } = this.state
    if (!currentLabel) {
      this.setState({ userLabels: [...userLabels, newLabel] })
      return
    }

    const updatedLabels = userLabels.map(label => label.id === currentLabel.id ? newLabel : label)
    this.setState({ userLabels: updatedLabels })
  }

  componentDidMount(): void {
    this.loadLabels()
  }

  render(): React.ReactNode {
    const { isLabelsLoading, userLabels, currentLabel, isError } = this.state

    if (isLabelsLoading) {
      return (
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          height='100vh'
        >
          <CircularProgress />
        </Box>
      )
    }

    if (isError) {
      return (
        <Typography
          color='danger'
          textAlign='center'
        >
          Failed to load labels. Please try again.
        </Typography>
      )
    }

    return (
      <Container maxWidth='md'>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2',
          }}
        >
          {userLabels.map(label => (
            <div
              key={label.name}
              style={{
                border: '1px',
                boxShadow: '2px',
                display: 'grid',
                width: '100%',
                padding: '4px',
                borderRadius: '8px',
              }}
            >
              <Chip
                variant='outlined'
                color='primary'
                size='lg'
                sx={{
                  background: label.color,
                  borderColor: label.color,
                  color: getTextColorFromBackgroundColor(label.color),
                }}
              >
                {label.name}
              </Chip>

              <div
                style={{
                  display: 'flex',
                  gap: 2,
                }}
              >
                <Button
                  size='sm'
                  variant='soft'
                  color='neutral'
                  onClick={() => this.handleEditLabel(label)}
                  startDecorator={<EditIcon />}
                >
                  Edit
                </Button>
                <IconButton
                  size='sm'
                  variant='soft'
                  onClick={() => this.handleDeleteLabel(label.id)}
                  color='danger'
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            </div>
          ))}
        </div>

        {userLabels.length === 0 && (
          <Typography
            textAlign='center'
            mt={2}
          >
            No labels available. Add a new label to get started.
          </Typography>
        )}

        <LabelModal
          ref={this.modalRef}
          onClose={this.onLabelModalClose}
          label={currentLabel}
        />

        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 10,
            p: 2,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
            'z-index': 1000,
          }}
        >
          <IconButton
            color='primary'
            variant='solid'
            sx={{
              borderRadius: '50%',
              width: 50,
              height: 50,
            }}
            onClick={this.handleAddLabel}
          >
            <Add />
          </IconButton>
        </Box>
      </Container>
    )
  }
}
