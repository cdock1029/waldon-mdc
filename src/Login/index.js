import React from 'react'
import firebase from '../firebase'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import './style.scss'
import { AppBar } from '../AppBar'
import firebaseui from 'firebaseui'

const uiConfig = {
  signInFlow: 'popup',
  callbacks: {
    signInSuccessWithAutResult: () => false,
  },
  credentialHelper: firebaseui.auth.CredentialHelper.NONE,
  signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID],
}

export class Login extends React.Component {
  componentDidMount() {
    document.querySelector('body').classList.add('darken')
  }
  componentWillUnmount() {
    document.querySelector('body').classList.remove('darken')
  }
  render() {
    return (
      <div>
        <AppBar />
        <div className="Login">
          <h1>WPM</h1>
          <StyledFirebaseAuth
            uiConfig={uiConfig}
            firebaseAuth={firebase.auth()}
          />
        </div>
      </div>
    )
  }
}
