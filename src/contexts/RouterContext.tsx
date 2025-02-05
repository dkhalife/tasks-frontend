import { App } from '../App'
import { TaskEdit } from '../views/Tasks/TaskEdit'
import { TasksOverview } from '../views/Tasks/TasksOverview'
import { Error } from '../views/Error'
import { Settings } from '../views/Settings/Settings'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ForgotPasswordView } from '../views/Authorization/ForgotPasswordView'
import { LoginView } from '../views/Authorization/LoginView'
import { SignupView } from '../views/Authorization/Signup'
import { UpdatePasswordView } from '../views/Authorization/UpdatePasswordView'
import { TaskView } from '../views/Tasks/TaskView'
import { MyTasks } from '../views/Tasks/MyTasks'
import { TaskHistory } from '../views/History/TaskHistory'
import { LabelView } from '../views/Labels/LabelView'
import React from 'react'
import { matchPath } from 'react-router-dom'

export class RouterContext extends React.Component {
  private getTaskId = (): string => {
    const match = matchPath<'taskId', string>(
      {
        path: '/tasks/:taskId',
        caseSensitive: true,
        end: false,
      },
      document.location.pathname,
    )

    if (!match) {
      return ""
    }

    return match.params.taskId as string
  }

  private getMainRoute = () => {
    if (window.innerWidth <= 768) {
      return <MyTasks />
    }

    return <TasksOverview />
  }

  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route
            path='/'
            element={<App />}
            errorElement={<Error />}
          >
            <Route
              path='/'
              element={this.getMainRoute()}
            />
            <Route
              path='/settings'
              element={<Settings />}
            />
            <Route
              path='/tasks'
              element={<TasksOverview />}
            />
            <Route
              path='/tasks/:taskId/edit'
              element={<TaskEdit taskId={this.getTaskId()} />}
            />
            <Route
              path='/tasks/:taskId'
              element={<TaskView taskId={this.getTaskId()} />}
            />
            <Route
              path='/tasks/create'
              element={<TaskEdit taskId={null} />}
            />
            <Route
              path='/tasks/:taskId/history'
              element={<TaskHistory taskId={this.getTaskId()} />}
            />
            <Route
              path='/my/tasks'
              element={<MyTasks />}
            />
            <Route
              path='/login'
              element={<LoginView />}
            />
            <Route
              path='/signup'
              element={<SignupView />}
            />
            <Route
              path='/forgot-password'
              element={<ForgotPasswordView />}
            />
            <Route
              path='/password/update'
              element={<UpdatePasswordView />}
            />
            <Route
              path='/labels/'
              element={<LabelView />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    )
  }
}
