import App from '@/App'
import ChoreEdit from '@/views/ChoreEdit/ChoreEdit'
import ChoresOverview from '@/views/ChoresOverview'
import Error from '@/views/Error'
import Settings from '@/views/Settings/Settings'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import ForgotPasswordView from '../views/Authorization/ForgotPasswordView'
import LoginView from '../views/Authorization/LoginView'
import SignupView from '../views/Authorization/Signup'
import UpdatePasswordView from '../views/Authorization/UpdatePasswordView'
import ChoreView from '../views/ChoreEdit/ChoreView'
import MyChores from '../views/Chores/MyChores'
import ChoreHistory from '../views/History/ChoreHistory'
import LabelView from '../views/Labels/LabelView'
import React from 'react'

const getMainRoute = () => {
  return <MyChores />
}
const Router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <Error />,
    children: [
      {
        path: '/',
        element: getMainRoute(),
      },
      {
        path: '/settings',
        element: <Settings />,
      },
      {
        path: '/chores',
        element: <ChoresOverview />,
      },
      {
        path: '/chores/:choreId/edit',
        element: <ChoreEdit />,
      },
      {
        path: '/chores/:choreId',
        element: <ChoreView />,
      },
      {
        path: '/chores/create',
        element: <ChoreEdit />,
      },
      {
        path: '/chores/:choreId/history',
        element: <ChoreHistory />,
      },
      {
        path: '/my/chores',
        element: <MyChores />,
      },
      {
        path: '/login',
        element: <LoginView />,
      },
      {
        path: '/signup',
        element: <SignupView />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPasswordView />,
      },
      {
        path: '/password/update',
        element: <UpdatePasswordView />,
      },
      {
        path: 'labels/',
        element: <LabelView />,
      },
    ],
  },
])

const RouterContext = ({ children }) => {
  return <RouterProvider router={Router} />
}

export default RouterContext
