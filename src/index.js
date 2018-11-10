import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import firebase from './firebase'
import { AuthProvider, AuthContext } from './firebase/Auth'
import App from './App'
import * as serviceWorker from './serviceWorker'
import { Login } from './Login'
import { Loading } from './Loading'

const root = document.getElementById('root')

firebase
  .firestore()
  .enablePersistence()
  .then(() => {
    ReactDOM.createRoot(root).render(
      <AuthProvider>
        <AuthContext.Consumer>
          {({ user }) => {
            if (typeof user === 'undefined') {
              return (
                <Loading>
                  <h1>Loading...</h1>
                </Loading>
              )
            }
            if (!user) {
              return <Login />
            }
            return <App />
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    )
  })

serviceWorker.unregister()
