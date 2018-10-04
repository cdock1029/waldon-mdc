import React from 'react'
import ReactDOM from 'react-dom'
import { observeUser } from './firebase'
import './index.css'
import App from './App'
import { Login } from './Login'
import * as serviceWorker from './serviceWorker'

observeUser(
  user => {
    ReactDOM.render(user ? <App /> : <Login />, document.getElementById('root'))
  },
  ['activeCompany', 'algoliaSecuredApiKey']
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
