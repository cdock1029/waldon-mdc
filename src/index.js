import React, { lazy, memo, Suspense } from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import firebase from './firebase'
import { AuthProvider, AuthContext } from './firebase/Auth'
import * as serviceWorker from './serviceWorker'
import { Loading } from './Loading'
import { FocusStyleManager } from '@blueprintjs/core'

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
            {({ user }) => {
              if (typeof user === 'undefined') {
                return <AppLoading key="appLoad" />
              }
              if (!user) {
                return <Login />
              }
              return <App />
            }}
          </AuthContext.Consumer>
        </AuthProvider>
      </Suspense>
    )
  })

serviceWorker.unregister()
