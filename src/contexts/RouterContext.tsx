import { App } from '../App'
import { ChoreEdit } from '../views/Chores/ChoreEdit'
import { ChoresOverview } from '../views/Chores/ChoresOverview'
import { Error } from '../views/Error'
import { Settings } from '../views/Settings/Settings'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ForgotPasswordView } from '../views/Authorization/ForgotPasswordView'
import { LoginView } from '../views/Authorization/LoginView'
import { SignupView } from '../views/Authorization/Signup'
import { UpdatePasswordView } from '../views/Authorization/UpdatePasswordView'
import { ChoreView } from '../views/Chores/ChoreView'
import { MyChores } from '../views/Chores/MyChores'
import { ChoreHistory } from '../views/History/ChoreHistory'
import { LabelView } from '../views/Labels/LabelView'
import React from 'react'
import { matchPath } from 'react-router-dom'

export class RouterContext extends React.Component {
  private getChoreId = (): string | undefined => {
    const match = matchPath<'choreId', string>({
      path: '/chores/:choreId',
      caseSensitive: true,
      end: false,
    }, document.location.pathname)
    return match?.params.choreId
  }

  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<App />} errorElement={<Error />}>
            <Route path='/' element={<MyChores />} />
            <Route path='/settings' element={<Settings />} />
            <Route path='/chores' element={<ChoresOverview />} />
            <Route path='/chores/:choreId/edit' element={<ChoreEdit choreId={this.getChoreId()} />} />
            <Route path='/chores/:choreId' element={<ChoreView choreId={this.getChoreId()} />} />
            <Route path='/chores/create' element={<ChoreEdit choreId={this.getChoreId()} />} />
            <Route path='/chores/:choreId/history' element={<ChoreHistory choreId={this.getChoreId()} />} />
            <Route path='/my/chores' element={<MyChores />} />
            <Route path='/login' element={<LoginView />} />
            <Route path='/signup' element={<SignupView />} />
            <Route path='/forgot-password' element={<ForgotPasswordView />} />
            <Route path='/password/update' element={<UpdatePasswordView />} />
            <Route path='/labels/' element={<LabelView />} />
          </Route>
        </Routes>
      </BrowserRouter>
    )
  }
}
