import React, { Component } from 'react'
import { AppBar } from '../AppBar'
import { Drawer } from '../Drawer'
import { DrawerAppContent } from 'rmwc'
import './styles.scss'

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
            <p>this is some content</p>
          </div>
        </DrawerAppContent>
      </div>
    )
  }
}

export default App
