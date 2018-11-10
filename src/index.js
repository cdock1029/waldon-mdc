import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import './index.scss'
import firebase from './firebase'
import { AuthProvider, AuthContext } from './firebase/Auth'
import App from './App'
import * as serviceWorker from './serviceWorker'
import { Login } from './Login'
import { Loading } from './Loading'

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <AuthProvider>
//     <App />
//   </AuthProvider>
// )

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

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
