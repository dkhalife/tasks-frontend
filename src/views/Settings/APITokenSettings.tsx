import { CopyAll } from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  Divider,
  IconButton,
  Input,
  Typography,
} from '@mui/joy'
import moment from 'moment'

import { TextModal } from '../Modals/Inputs/TextModal'
import React from 'react'
import { APIToken } from '../../models/token'
import { CreateLongLiveToken, DeleteLongLiveToken, GetLongLiveTokens } from '../../api/users'

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
    GetLongLiveTokens().then(resp => {
      resp.json().then(data => {
        this.setState({ tokens: data.res })
      })
    })
  }

  private handleSaveToken = name => {
    CreateLongLiveToken(name).then(resp => {
      if (resp.ok) {
        resp.json().then(data => {
          const newTokens = [...this.state.tokens]
          newTokens.push(data.res)

          this.setState({
            tokens: newTokens,
          })
        })
      }
    })
  }

  render(): React.ReactNode {
    const { tokens, showTokenId } = this.state

    return (
      <div
        className='grid gap-4 py-4'
        id='apitokens'
      >
        <Typography level='h3'>Access Token</Typography>
        <Divider />
        <Typography level='body-sm'>
          Create token to use with the API to update chores
        </Typography>

        {tokens.map((token: APIToken) => (
          <Card
            key={token.token}
            className='p-4'
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
                  onClick={() => {
                    const confirmed = confirm(
                      `Are you sure you want to remove ${token.name} ?`,
                    )
                    if (confirmed) {
                      DeleteLongLiveToken(token.id).then(resp => {
                        if (resp.ok) {
                          const newTokens = tokens.filter(
                            (t: APIToken) => t.id !== token.id,
                          )
                          this.setState({ tokens: newTokens })
                        }
                      })
                    }
                  }}
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
