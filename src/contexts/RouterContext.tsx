import { App } from '@/App'
import { getHomeView, getPathName } from '@/utils/navigation'
import { ForgotPasswordView } from '@/views/Authorization/ForgotPasswordView'
import { LoginView } from '@/views/Authorization/LoginView'
import { SignupView } from '@/views/Authorization/Signup'
import { UpdatePasswordView } from '@/views/Authorization/UpdatePasswordView'
import { TaskHistory } from '@/views/History/TaskHistory'
import { LabelView } from '@/views/Labels/LabelView'
import { NotFound } from '@/views/NotFound'
import { Settings } from '@/views/Settings/Settings'
import { MyTasks } from '@/views/Tasks/MyTasks'
import { TaskEdit } from '@/views/Tasks/TaskEdit'
import { TasksOverview } from '@/views/Tasks/TasksOverview'
import React from 'react'
import {
  BrowserRouter,
  matchPath,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

type RouterContextState = {
  navigateTo: string | null
}

export class RouterContext extends React.Component<object, RouterContextState> {
  constructor(props: object) {
    super(props)

    this.state = {
      navigateTo: null,
    }
  }
  private getTaskId = (): number => {
    const match = matchPath<'taskId', string>(
      {
        path: '/tasks/:taskId',
        caseSensitive: true,
        end: false,
      },
      getPathName(),
    )

    if (!match) {
      return -1
    }

    return parseInt(match.params.taskId as string)
  }

  private getMainRoute = () => {
    const home_view = getHomeView()

    if (home_view === 'my_tasks') {
      return <MyTasks navigate={this.navigate} />
    }

    return <TasksOverview navigate={this.navigate} />
  }

  private navigate = (path: string) => {
    this.setState({
      navigateTo: path,
    })
  }

  componentDidUpdate(): void {
    if (this.state.navigateTo !== null) {
      this.setState({
        navigateTo: null,
      })
    }
  }

  render() {
    const { navigateTo } = this.state

    return (
      <BrowserRouter>
        <Routes>
          <Route
            path='/'
            element={<App navigate={this.navigate} />}
            errorElement={<NotFound />}
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
              element={<TasksOverview navigate={this.navigate} />}
            />
            <Route
              path='/tasks/:taskId/edit'
              element={
                <TaskEdit
                  taskId={this.getTaskId()}
                  navigate={this.navigate}
                />
              }
            />
            <Route
              path='/tasks/create'
              element={
                <TaskEdit
                  taskId={null}
                  navigate={this.navigate}
                />
              }
            />
            <Route
              path='/tasks/:taskId/history'
              element={<TaskHistory taskId={this.getTaskId()} />}
            />
            <Route
              path='/my/tasks'
              element={<MyTasks navigate={this.navigate} />}
            />
            <Route
              path='/login'
              element={<LoginView navigate={this.navigate} />}
            />
            <Route
              path='/signup'
              element={<SignupView navigate={this.navigate} />}
            />
            <Route
              path='/forgot-password'
              element={<ForgotPasswordView navigate={this.navigate} />}
            />
            <Route
              path='/password/update'
              element={<UpdatePasswordView navigate={this.navigate} />}
            />
            <Route
              path='/labels/'
              element={<LabelView />}
            />
          </Route>
        </Routes>

        {navigateTo && <Navigate to={navigateTo} />}
      </BrowserRouter>
    )
  }
}
