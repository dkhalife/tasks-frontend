import { Close } from '@mui/icons-material'
import {
  Box,
  Button,
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
  const { userProfile, setUserProfile } = useContext<any>(UserContext)
  useEffect(() => {
    if (!userProfile) {
      GetUserProfile().then(resp => {
        resp.json().then(data => {
          setUserProfile(data.res)
        })
      })
    }
  }, [userProfile, setUserProfile])

  const [notificationTarget, setNotificationTarget] = useState<string|null>(
    userProfile?.notification_target
      ? String(userProfile.notification_target.type)
      : '0',
  )

  const [error, setError] = useState('')
  const SaveValidation = () => {
    setError('')
    return true
  }
  const handleSave = () => {
    if (!SaveValidation()) return

    UpdateNotificationTarget({
      type: Number(notificationTarget),
    }).then(resp => {
      if (resp.status != 200) {
        alert(`Error while updating notification target: ${resp.statusText}`)
        return
      }

      setUserProfile({
        ...userProfile,
        notification_target: {
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
      </FormControl>
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
          <Option value='3'>Mqtt</Option>
        </Select>
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
