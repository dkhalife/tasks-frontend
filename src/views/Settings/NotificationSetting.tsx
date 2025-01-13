import { Close } from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
  Option,
  Select,
  Snackbar,
  Switch,
  Typography,
} from '@mui/joy'
import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../contexts/UserContext'
import {
  GetUserProfile,
  UpdateNotificationTarget,
  UpdateUserDetails,
} from '../../utils/Fetcher'

const NotificationSetting = () => {
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false)
  const { userProfile, setUserProfile } = useContext(UserContext)
  useEffect(() => {
    if (!userProfile) {
      GetUserProfile().then(resp => {
        resp.json().then(data => {
          setUserProfile(data.res)
          setChatID(data.res.chatID)
        })
      })
    }
  }, [])
  const getNotificationPreferences = async () => {
    const ret = await Preferences.get({ key: 'notificationPreferences' })
    return JSON.parse(ret.value)
  }
  const setNotificationPreferences = async value => {
    if (value.granted === false) {
      await Preferences.set({
        key: 'notificationPreferences',
        value: JSON.stringify({ granted: false }),
      })
      return
    }
    const currentSettings = await getNotificationPreferences()
    await Preferences.set({
      key: 'notificationPreferences',
      value: JSON.stringify({ ...currentSettings, ...value }),
    })
  }

  const getPushNotificationPreferences = async () => {
    const ret = await Preferences.get({ key: 'pushNotificationPreferences' })
    return JSON.parse(ret.value)
  }

  const setPushNotificationPreferences = async value => {
    await Preferences.set({
      key: 'pushNotificationPreferences',
      value: JSON.stringify(value),
    })
  }

  const [deviceNotification, setDeviceNotification] = useState(false)

  const [dueNotification, setDueNotification] = useState(true)
  const [preDueNotification, setPreDueNotification] = useState(false)
  const [naggingNotification, setNaggingNotification] = useState(false)
  const [pushNotification, setPushNotification] = useState(false)

  useEffect(() => {
    getNotificationPreferences().then(resp => {
      setDeviceNotification(resp.granted)
      setDueNotification(resp.dueNotification)
      setPreDueNotification(resp.preDueNotification)
      setNaggingNotification(resp.naggingNotification)
    })
    getPushNotificationPreferences().then(resp => {
      setPushNotification(resp.granted)
    })
  }, [])

  const [notificationTarget, setNotificationTarget] = useState(
    userProfile?.notification_target
      ? String(userProfile.notification_target.type)
      : '0',
  )

  const [chatID, setChatID] = useState(
    userProfile?.notification_target?.target_id,
  )
  const [error, setError] = useState('')
  const SaveValidation = () => {
    switch (notificationTarget) {
      case '1':
        if (chatID === '') {
          setError('Chat ID is required')
          return false
        } else if (isNaN(chatID) || chatID === '0') {
          setError('Invalid Chat ID')
          return false
        }
        break
      case '2':
        if (chatID === '') {
          setError('User key is required')
          return false
        }
        break
      default:
        break
    }
    setError('')
    return true
  }
  const handleSave = () => {
    if (!SaveValidation()) return

    UpdateNotificationTarget({
      target: chatID,
      type: Number(notificationTarget),
    }).then(resp => {
      if (resp.status != 200) {
        alert(`Error while updating notification target: ${resp.statusText}`)
        return
      }

      setUserProfile({
        ...userProfile,
        notification_target: {
          target: chatID,
          type: Number(notificationTarget),
        },
      })
      alert('Notification target updated')
    })
  }
  return (
    <div className='grid gap-4 py-4' id='notifications'>
      <Typography level='h3'>Custom Notification</Typography>
      <Divider />
      <Typography level='body-md'>
        Notificaiton through other platform like Telegram or Pushover
      </Typography>

      <FormControl
        orientation='horizontal'
        sx={{ width: 400, justifyContent: 'space-between' }}
      >
        <div>
          <FormLabel>Custom Notification</FormLabel>
          <FormHelperText sx={{ mt: 0 }}>
            Receive notification on other platform
          </FormHelperText>
        </div>
        <Switch
          checked={chatID !== 0}
          onClick={event => {
            event.preventDefault()
            if (chatID !== 0) {
              setChatID(0)
            } else {
              setChatID('')
              UpdateUserDetails({
                chatID: Number(0),
              }).then(resp => {
                resp.json().then(data => {
                  setUserProfile(data)
                })
              })
            }
            setNotificationTarget('0')
            handleSave()
          }}
          color={chatID !== 0 ? 'success' : 'neutral'}
          variant={chatID !== 0 ? 'solid' : 'outlined'}
          endDecorator={chatID !== 0 ? 'On' : 'Off'}
          slotProps={{
            endDecorator: {
              sx: {
                minWidth: 24,
              },
            },
          }}
        />
      </FormControl>
      {chatID !== 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Select
            value={notificationTarget}
            sx={{ maxWidth: '200px' }}
            onChange={(e, selected) => setNotificationTarget(selected)}
          >
            <Option value='0'>None</Option>
            <Option value='1'>Telegram</Option>
            <Option value='2'>Pushover</Option>
            <Option value='2'>Mqtt</Option>
          </Select>
          {notificationTarget === '1' && (
            <>
              <Typography level='body-xs'>
                You need to initiate a message to the bot in order for the
                Telegram notification to work{' '}
                <a
                  style={{
                    textDecoration: 'underline',
                    color: '#0891b2',
                  }}
                  href='https://t.me/DonetickBot'
                >
                  Click here
                </a>{' '}
                to start a chat
              </Typography>

              <Typography level='body-sm'>Chat ID</Typography>

              <Input
                value={chatID}
                onChange={e => setChatID(e.target.value)}
                placeholder='User ID / Chat ID'
                sx={{
                  width: '200px',
                }}
              />
              <Typography mt={0} level='body-xs'>
                If you don't know your Chat ID, start chat with userinfobot and
                it will send you your Chat ID.{' '}
                <a
                  style={{
                    textDecoration: 'underline',
                    color: '#0891b2',
                  }}
                  href='https://t.me/userinfobot'
                >
                  Click here
                </a>{' '}
                to start chat with userinfobot{' '}
              </Typography>
            </>
          )}
          {notificationTarget === '2' && (
            <>
              <Typography level='body-sm'>User key</Typography>
              <Input
                value={chatID}
                onChange={e => setChatID(e.target.value)}
                placeholder='User ID'
                sx={{
                  width: '200px',
                }}
              />
            </>
          )}
          {error && (
            <Typography color='warning' level='body-sm'>
              {error}
            </Typography>
          )}

          <Button
            sx={{
              width: '110px',
              mb: 1,
            }}
            onClick={handleSave}
          >
            Save
          </Button>
        </Box>
      )}
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={8000}
        onClose={() => setIsSnackbarOpen(false)}
        endDecorator={
          <IconButton size='md' onClick={() => setIsSnackbarOpen(false)}>
            <Close />
          </IconButton>
        }
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography level='title-md'>Permission Denied</Typography>
          <Typography level='body-md'>
            You have denied the permission to receive notification on this
            device. Please enable it in your device settings
          </Typography>
        </div>
      </Snackbar>
    </div>
  )
}

export default NotificationSetting
