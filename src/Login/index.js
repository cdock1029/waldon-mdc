import React, { useEffect } from 'react'
import styled from 'react-emotion/macro'
import firebase from '../firebase'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import firebaseui from 'firebaseui'

const uiConfig = {
  signInFlow: 'popup',
  callbacks: {
    signInSuccessWithAutResult: () => false,
  },
  credentialHelper: firebaseui.auth.CredentialHelper.NONE,
  signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID],
}

export function Login() {
  useEffect(() => {
    document.querySelector('body').classList.add('darken')
    return () => {
      document.querySelector('body').classList.remove('darken')
    }
  }, [])
  return (
    <LoginPage>
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
    </LoginPage>
  )
}

const LoginPage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  padding-top: 10rem;
`
