import React, { Component } from 'react'
import { AppBar } from '../AppBar'
import { Drawer } from '../Drawer'
import { DrawerAppContent } from 'rmwc'
import { Router } from '@reach/router'
// import { NewProperty } from '../NewProperty'
// import { NewTenant } from '../NewTenant'
import './styles.scss'

const Home = () => <h1>Home</h1>

class App extends Component {
  state = {
    isOpen: true,
  }
  handleMenuClick = () => this.setState(({ isOpen }) => ({ isOpen: !isOpen }))
  render() {
    const { isOpen } = this.state
    return (
      <div className="App">
        <Drawer isOpen={isOpen} />
        <DrawerAppContent className="DrawerAppContent">
          <AppBar onMenuClick={this.handleMenuClick} />
          <div className="Content">
            <Router>
              <Home path="/" />
              {/* <NewProperty path="new-property" />
              <NewTenant path="new-tenant" /> */}
            </Router>
          </div>
        </DrawerAppContent>
      </div>
    )
  }
}

export default App
