import React, { lazy, memo, Suspense, useState } from 'react'
import ReactDOM from 'react-dom'
import { FocusStyleManager } from '@blueprintjs/core'
import './index.css'
import firebase from './firebase'
import { AuthProvider, AuthContext } from './firebase/Auth'
import * as serviceWorker from './serviceWorker'
import { Loading } from './Loading'
import CreateCompany from './CreateCompany'

FocusStyleManager.onlyShowFocusOnTabs()

const Login = lazy(() => import('./Login'))
const App = lazy(() => import('./App'))

const root = document.getElementById('root')

const AppLoading = memo(function() {
  return (
    <Loading>
      <h1>Loading...</h1>
    </Loading>
  )
})

const Root = ReactDOM.createRoot(root)
Root.render(<AppLoading key="appLoad" />)

firebase
  .firestore()
  .enablePersistence()
  .then(() => {
    Root.render(
      <Suspense maxDuration={600} fallback={<AppLoading key="appLoad" />}>
        <AuthProvider>
          <AuthContext.Consumer>
            {({ user, claims, signOut }) => {
              if (typeof user === 'undefined') {
                return <AppLoading key="appLoad" />
              }
              if (!user) {
                return <Login />
              }
              if (!user.emailVerified) {
                return <EmailVerification user={user} signOut={signOut} />
              }
              // if (!claims.activeCompany) {
              if (1 === 1) {
                return <CreateCompany user={user} signOut={signOut} />
              }
              return <App />
            }}
          </AuthContext.Consumer>
        </AuthProvider>
      </Suspense>
    )
  })

function EmailVerification({ user, signOut }) {
  const [emailSent, setEmailSent] = useState(false)
  function sendEmail() {
    user.sendEmailVerification().then(() => {
      setInterval(() => {
        user.reload()
        console.log('reloaded user...', { emailVerified: user.emailVerified })
        if (user.emailVerified) {
          window.location.reload()
        }
      }, 3000)
      setEmailSent(true)
    })
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '2em',
      }}
    >
      <h3>Email is not verified.</h3>
      <h4>Click button to send verification email to: {user.email}</h4>
      {emailSent ? (
        <h5>
          Email sent. Check your inbox, and follow verification link to proceed.
        </h5>
      ) : (
        <div>
          <button style={{ marginRight: '2em' }} onClick={sendEmail}>
            Send verification email
          </button>
          <button onClick={signOut}>Sign out</button>
        </div>
      )}
    </div>
  )
}

serviceWorker.unregister()
