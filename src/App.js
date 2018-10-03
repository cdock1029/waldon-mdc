import React, { Component } from 'react'
import { AppBar } from './AppBar'
import { TopAppBarFixedAdjust } from 'rmwc'
import firebase from './firebase'
import './App.css'

class App extends Component {
  signOut = () => {
    firebase.auth().signOut()
  }
  render() {
    const { user } = this.props
    return (
      <div className="App">
        <AppBar />
        <TopAppBarFixedAdjust />
        <div>
          <button onClick={this.signOut}>Sign Out</button>
          <pre>user: {user.email}</pre>
        </div>
        <header className="App-header">
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    )
  }
}

export default App
