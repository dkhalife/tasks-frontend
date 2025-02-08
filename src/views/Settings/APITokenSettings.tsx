import {
  GetLongLiveTokens,
  CreateLongLiveToken,
  DeleteLongLiveToken,
} from '@/api/users'
import { APIToken } from '@/models/token'
import { CopyAll } from '@mui/icons-material'
import {
  Typography,
  Divider,
  Card,
  Box,
  Button,
  Input,
  IconButton,
} from '@mui/joy'
import moment from 'moment'
import React from 'react'
import { TextModal } from '../Modals/Inputs/TextModal'

type APITokenSettingsProps = object

interface APITokenSettingsState {
  tokens: APIToken[]
  showTokenId: string | null
}

export class APITokenSettings extends React.Component<
  APITokenSettingsProps,
  APITokenSettingsState
> {
  private modalRef = React.createRef<TextModal>()

  constructor(props: APITokenSettingsProps) {
    super(props)

    this.state = {
      tokens: [],
      showTokenId: null,
    }
  }

  componentDidMount(): void {
    GetLongLiveTokens().then(data => {
      this.setState({ tokens: data.tokens })
    })
  }

  private handleSaveToken = async (name: string | null) => {
    if (!name) {
      return
    }

    const data = await CreateLongLiveToken(name)
    const newTokens = [...this.state.tokens]
    newTokens.push(data.token)

    this.setState({
      tokens: newTokens,
    })
  }

  private onDeleteToken = async (token: APIToken) => {
    const { tokens } = this.state

    // TODO: Replace with a modern modal
    if (!confirm(`Are you sure you want to remove ${token.name} ?`)) {
      return
    }

    await DeleteLongLiveToken(token.id)

    this.setState({
      tokens: tokens.filter((t: APIToken) => t.id !== token.id),
    })
  }

  render(): React.ReactNode {
    const { tokens, showTokenId } = this.state

    return (
      <div
        style={{
          display: 'grid',
          gap: '4',
          paddingTop: '4',
          paddingBottom: '4',
        }}
        id='apitokens'
      >
        <Typography level='h3'>Access Token</Typography>
        <Divider />
        <Typography level='body-sm'>
          Create token to use with the API to update tasks
        </Typography>

        {tokens.map((token: APIToken) => (
          <Card
            key={token.token}
            style={{ padding: '4px' }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography level='body-md'>{token.name}</Typography>
                <Typography level='body-xs'>
                  {moment(token.createdAt).fromNow()}(
                  {moment(token.createdAt).format('lll')})
                </Typography>
              </Box>
              <Box>
                <Button
                  variant='outlined'
                  color='primary'
                  sx={{ mr: 1 }}
                  onClick={() => {
                    if (showTokenId === token.id) {
                      this.setState({ showTokenId: null })
                      return
                    }

                    this.setState({ showTokenId: token.id })
                  }}
                >
                  {showTokenId === token?.id ? 'Hide' : 'Show'} Token
                </Button>

                <Button
                  variant='outlined'
                  color='danger'
                  onClick={() => this.onDeleteToken(token)}
                >
                  Remove
                </Button>
              </Box>
            </Box>
            {showTokenId === token?.id && (
              <Box>
                <Input
                  value={token.token}
                  sx={{ width: '100%', mt: 2 }}
                  readOnly
                  endDecorator={
                    <IconButton
                      variant='outlined'
                      color='primary'
                      onClick={() => {
                        navigator.clipboard.writeText(token.token)
                        this.setState({ showTokenId: null })
                      }}
                    >
                      <CopyAll />
                    </IconButton>
                  }
                />
              </Box>
            )}
          </Card>
        ))}

        <Button
          variant='soft'
          color='primary'
          sx={{
            width: '210px',
            mb: 1,
          }}
          onClick={() => {
            this.modalRef.current?.open()
          }}
        >
          Generate New Token
        </Button>
        <TextModal
          ref={this.modalRef}
          title='Give a name for your new token, something to remember it by.'
          onClose={this.handleSaveToken}
          okText={'Generate Token'}
        />
      </div>
    )
  }
}
