import {
  GetLongLiveTokens,
  CreateLongLiveToken,
  DeleteLongLiveToken,
} from '@/api/tokens'
import { APIToken, ApiTokenScope } from '@/models/token'
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
import React from 'react'
import { TokenModal } from '../Modals/Inputs/TokenModal'
import { ConfirmationModal } from '../Modals/Inputs/ConfirmationModal'
import { formatDistanceToNow } from 'date-fns'

type APITokenSettingsProps = object

interface APITokenSettingsState {
  tokens: APIToken[]
  showTokenId: string | null
}

export class APITokenSettings extends React.Component<
  APITokenSettingsProps,
  APITokenSettingsState
> {
  private modalRef = React.createRef<TokenModal>()
  private tokenToDelete: APIToken | null = null
  private confirmModalRef = React.createRef<ConfirmationModal>()

  constructor(props: APITokenSettingsProps) {
    super(props)

    this.state = {
      tokens: [],
      showTokenId: null,
    }
  }

  private loadTokens = async () => {
    const data = await GetLongLiveTokens()
    this.setState({
      tokens: data.tokens,
    })
  }

  componentDidMount(): void {
    this.loadTokens()
  }

  private handleSaveToken = async (
    name: string | null,
    scopes: ApiTokenScope[],
    expiration: number,
  ) => {
    if (!name) {
      return
    }

    const data = await CreateLongLiveToken(name, scopes, expiration)
    const newTokens = [...this.state.tokens]
    newTokens.push(data.token)

    this.setState({
      tokens: newTokens,
      showTokenId: data.token.id,
    })
  }

  private onDeleteToken = async (token: APIToken) => {
    this.tokenToDelete = token
    this.confirmModalRef.current?.open()
  }

  private onDeleteConfirmation = async (confirmed: boolean) => {
    if (!confirmed) {
      return
    }

    const token = this.tokenToDelete
    if (!token) {
      throw new Error('No token to delete')
    }

    const { tokens } = this.state
    await DeleteLongLiveToken(token.id)

    this.setState({
      tokens: tokens.filter((t: APIToken) => t.id !== token.id),
    })
  }

  private toggleTokenVisibility = (token: APIToken) => {
    const { showTokenId } = this.state
    if (showTokenId === token.id) {
      this.setState({ showTokenId: null })
      return
    }

    this.setState({ showTokenId: token.id })
  }

  private onCopyToken = (token: APIToken) => {
    navigator.clipboard.writeText(token.token)
    this.setState({ showTokenId: null })
  }

  private onGenerateToken = () => {
    this.modalRef.current?.open()
  }

  render(): React.ReactNode {
    const { tokens, showTokenId } = this.state

    return (
      <Box sx={{ mt: 2 }}>
        <Typography level='h3'>Access Token</Typography>
        <Divider />

        {tokens.map((token: APIToken) => (
          <Card
            key={`token-${token.id}`}
            style={{ padding: '4px' }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography level='body-md'>{token.name}</Typography>
                <Typography level='body-xs'>Expiration: {formatDistanceToNow(token.expires_at)}</Typography>
              </Box>
              <Box>
                {token.token && (
                  <Button
                    variant='outlined'
                    color='primary'
                    sx={{ mr: 1 }}
                    onClick={() => this.toggleTokenVisibility(token)}
                  >
                    {showTokenId === token?.id ? 'Hide' : 'Show'}
                  </Button>
                )}
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
                  sx={{ width: '100%' }}
                  readOnly
                  endDecorator={
                    <IconButton
                      variant='outlined'
                      color='primary'
                      onClick={() => this.onCopyToken(token)}
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
            mt: 1,
          }}
          onClick={this.onGenerateToken}
        >
          Generate New Token
        </Button>

        <TokenModal
          ref={this.modalRef}
          onClose={this.handleSaveToken}
          okText={'Generate Token'}
        />

        <ConfirmationModal
          ref={this.confirmModalRef}
          title='Delete Token'
          confirmText='Delete'
          cancelText='Cancel'
          message='Are you sure you want to delete this token?'
          onClose={this.onDeleteConfirmation}
        />
      </Box>
    )
  }
}
