import { DeleteLabel, GetLabels } from "@/api/labels"
import { Label } from "@/models/label"
import { getTextColorFromBackgroundColor } from "@/utils/Colors"
import { Add } from "@mui/icons-material"
import { Box, CircularProgress, Typography, Container, Chip, Button, IconButton } from "@mui/joy"
import React from "react"
import { LabelModal } from "../Modals/Inputs/LabelModal"

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

  private handleDeleteLabel = (id: string) => {
    DeleteLabel(id).then(() => {
      const { userLabels } = this.state
      const updatedLabels = userLabels.filter(label => label.id !== id)

      this.setState({ userLabels: updatedLabels })
    })
  }

  componentDidMount(): void {
    GetLabels().then(
      res => {
        this.setState({
          userLabels: res,
          isLabelsLoading: false,
        })
      },
      () => {
        this.setState({
          isLabelsLoading: false,
          isError: true,
        })
      },
    )
  }

  render(): React.ReactNode {
    const { isLabelsLoading, userLabels, currentLabel, isError } =
      this.state

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
        <div className='flex flex-col gap-2'>
          {userLabels.map(label => (
            <div
              key={label.name}
              className='grid w-full grid-cols-[1fr,auto,auto] rounded-lg border border-zinc-200/80 p-4 shadow-sm dark:bg-zinc-900'
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

              <div className='flex gap-2'>
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
          onClose={() => console.error('missing impl')}
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
