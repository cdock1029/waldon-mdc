import React, { Component } from 'react'
import { AppBar } from './AppBar'
import { Drawer } from './Drawer'
import { DrawerAppContent } from 'rmwc'
import './App.css'

class App extends Component {
  state = {
    isOpen: false,
  }
  handleMenuClick = () => this.setState(({ isOpen }) => ({ isOpen: !isOpen }))
  render() {
    const { isOpen } = this.state
    return (
      <div className="App">
        <AppBar onMenuClick={this.handleMenuClick} />
        <Drawer isOpen={isOpen} />
        <DrawerAppContent>
          <p>this is some content</p>
        </DrawerAppContent>
      </div>
    )
  }
}

export default App
