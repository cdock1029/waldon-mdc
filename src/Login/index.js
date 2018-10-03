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
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    // firebase.auth.FacebookAuthProvider.PROVIDER_ID
  ],
}

export class Login extends React.Component {
  render() {
    return (
      <div>
        <AppBar />
        <div className="Login">
          <h1>My App</h1>
          <p>Please sign-in:</p>
          <StyledFirebaseAuth
            uiConfig={uiConfig}
            firebaseAuth={firebase.auth()}
          />
        </div>
      </div>
    )
  }
}
