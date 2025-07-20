import { Label } from '@/models/label'
import { colorOptionFromColor, getTextColorFromBackgroundColor } from '@/utils/colors'
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
import { setTitle } from '@/utils/dom'
import { ConfirmationModal } from '../Modals/Inputs/ConfirmationModal'
import { AppDispatch, RootState } from '@/store/store'
import { connect } from 'react-redux'
import { deleteLabel, enterEditMode } from '@/store/labelsSlice'

type LabelViewProps = {
  isLoading: boolean
  labels: Label[]
  deleteLabel: (id: string) => Promise<any>
  enterEditMode: () => void
}

interface LabelViewState {
  currentLabel: Label | null
  isError: boolean
}

class LabelViewImpl extends React.Component<LabelViewProps, LabelViewState> {
  private confirmModalRef = React.createRef<ConfirmationModal>()
  private labelIdPendingDelete: string | null = null

  constructor(props: LabelViewProps) {
    super(props)

    this.state = {
      currentLabel: null,
      isError: false,
    }
  }

  private onAddLabelClicked = async () => {
    await this.setState({
      currentLabel: null,
    })

    this.props.enterEditMode()
  }

  private onEditLabelClicked = async (label: Label) => {
    await this.setState({
      currentLabel: label,
    })

    this.props.enterEditMode()
  }

  private onDeleteLabelClicked = (id: string) => {
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

    await this.props.deleteLabel(id)
  }

  private isUniqueLabelName = (
    id: string | undefined,
    labelName: string,
  ): boolean => {
    const { labels } = this.props
    return !labels.some(
      label => label.name === labelName && label.id !== id,
    )
  }

  componentDidMount(): void {
    // this.registerWebSocketListeners()

    setTitle('Labels')
  }

  // componentWillUnmount(): void {
  //   this.unregisterWebSocketListeners()
  // }

  // private onLabelCreatedWS = (data: unknown) => {
  //   const newLabel = (data as any).label as Label
  //   this.onLabelCreated(newLabel)
  // }

  // private onLabelUpdatedWS = (data: unknown) => {
  //   const updatedLabel = (data as any).label as Label
  //   this.onLabelUpdated(updatedLabel)
  // }

  // private onLabelDeletedWS = (data: unknown) => {
  //   const deletedLabelId = (data as any).id as string
  //   this.onLabelDeleted(deletedLabelId)
  // }

  // private registerWebSocketListeners = () => {
  //   this.ws.on('label_created', this.onLabelCreatedWS);
  //   this.ws.on('label_updated', this.onLabelUpdatedWS);
  //   this.ws.on('label_deleted', this.onLabelDeletedWS);
  // }

  // private unregisterWebSocketListeners = () => {
  //   this.ws.off('label_created', this.onLabelCreatedWS);
  //   this.ws.off('label_updated', this.onLabelUpdatedWS);
  //   this.ws.off('label_deleted', this.onLabelDeletedWS);
  // }

  render(): React.ReactNode {
    const { labels, isLoading } = this.props
    const { currentLabel, isError } = this.state
    const currentColor = currentLabel
      ? colorOptionFromColor(currentLabel.color)
      : undefined

    if (isLoading) {
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
          {labels.map(label => (
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
                  onClick={() => this.onEditLabelClicked(label)}
                  startDecorator={<EditIcon />}
                >
                  Edit
                </Button>
                <Button
                  size='sm'
                  variant='soft'
                  onClick={() => this.onDeleteLabelClicked(label.id)}
                  startDecorator={<DeleteIcon />}
                  color='danger'
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        {labels.length === 0 && (
          <Typography
            textAlign='center'
            mt={2}
          >
            No labels available. Add one to get started.
          </Typography>
        )}

        <LabelModal
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
            onClick={this.onAddLabelClicked}
          >
            <Add />
          </IconButton>
        </Box>
      </Container>
    )
  }
}

const mapStateToProps = (state: RootState) => ({
  isLoading: state.labels.status === 'loading',
  labels: state.labels.items
})

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  deleteLabel: (id: string) => dispatch(deleteLabel(id)),
  enterEditMode: () => dispatch(enterEditMode()),
})

export const LabelView = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LabelViewImpl)
