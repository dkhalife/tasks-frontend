import { DeleteLabel, GetLabels } from '@/api/labels'
import { Label } from '@/models/label'
import { getTextColorFromBackgroundColor } from '@/utils/colors'
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
import { colorOptionFromColor } from '@/utils/labels'
import { setTitle } from '@/utils/dom'
import { ConfirmationModal } from '../Modals/Inputs/ConfirmationModal'

type LabelViewProps = object

interface LabelViewState {
  isLabelsLoading: boolean
  userLabels: Label[]
  currentLabel: Label | null
  isError: boolean
}

export class LabelView extends React.Component<LabelViewProps, LabelViewState> {
  private modalRef = React.createRef<LabelModal>()
  private confirmModalRef = React.createRef<ConfirmationModal>()
  private labelIdPendingDelete: string | null = null

  constructor(props: LabelViewProps) {
    super(props)

    this.state = {
      isLabelsLoading: true,
      userLabels: [],
      currentLabel: null,
      isError: false,
    }
  }

  private handleAddLabel = async () => {
    await this.setState({
      currentLabel: null,
    })

    this.modalRef.current?.open()
  }

  private handleEditLabel = async (label: Label) => {
    await this.setState({
      currentLabel: label,
    })

    this.modalRef.current?.open()
  }

  private handleDeleteLabel = (id: string) => {
    this.labelIdPendingDelete = id
    this.confirmModalRef.current?.open()
  }

  private onDeleteConfirmed = async (isConfirmed: boolean) => {
    if (!isConfirmed) {
      this.labelIdPendingDelete = null
      return
    }

    const { labelIdPendingDelete: id } = this
    if (!id) {
      throw new Error('Label ID is null')
    }

    await DeleteLabel(id)

    const { userLabels } = this.state
    const updatedLabels = userLabels.filter(label => label.id !== id)

    this.labelIdPendingDelete = null
    this.setState({
      userLabels: updatedLabels,
    })
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

  private isUniqueLabelName = (id: string | undefined, labelName: string): boolean => {
    const { userLabels } = this.state
    return !userLabels.some(label => label.name === labelName && label.id !== id)
  }

  private onLabelModalClose = (newLabel: Label | null) => {
    if (!newLabel) {
      // No creation or update was made
      return
    }

    const { userLabels, currentLabel } = this.state
    if (!currentLabel) {
      this.setState({
        userLabels: [...userLabels, newLabel],
      })
      return
    }

    const updatedLabels = userLabels.map(label => label.id === currentLabel.id ? newLabel : label)
    this.setState({
      userLabels: updatedLabels,
    })
  }

  componentDidMount(): void {
    this.loadLabels()

    setTitle('Labels')
  }

  render(): React.ReactNode {
    const { isLabelsLoading, userLabels, currentLabel, isError } = this.state
    const currentColor = currentLabel ? colorOptionFromColor(currentLabel.color) : undefined

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
            alignItems: 'center',
            gap: '4px',
            marginTop: '16px',
          }}
        >
          {userLabels.map(label => (
            <div
              key={`label-${label.id}`}
              style={{
                border: '1px solid #ccc',
                boxShadow: '2px',
                display: 'grid',
                width: '100%',
                maxWidth: '400px',
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
                  gridColumn: '1',
                }}
              >
                {label.name}
              </Chip>

              <div
                style={{
                  display: 'flex',
                  gridColumn: '2',
                  gap: 2,
                  justifyContent: 'flex-end',
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
                <Button
                  size='sm'
                  variant='soft'
                  onClick={() => this.handleDeleteLabel(label.id)}
                  startDecorator={<DeleteIcon />}
                  color='danger'
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        {userLabels.length === 0 && (
          <Typography
            textAlign='center'
            mt={2}
          >
            No labels available. Add one to get started.
          </Typography>
        )}

        <LabelModal
          ref={this.modalRef}
          onClose={this.onLabelModalClose}
          isUnique={this.isUniqueLabelName}
          id={currentLabel?.id}
          name={currentLabel?.name}
          color={currentColor}
        />

        <ConfirmationModal
          ref={this.confirmModalRef}
          title='Delete Label'
          confirmText='Delete'
          cancelText='Cancel'
          message='Are you sure you want to delete this label?'
          onClose={this.onDeleteConfirmed}
        />

        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            right: 10,
            padding: 2,
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
