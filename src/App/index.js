import React, { Component } from 'react'
import { Router } from '@reach/router'
import { DrawerAppContent } from 'rmwc'
import { AppBar } from '../AppBar'
import { Drawer } from '../Drawer'
import { Dashboard } from '../Dashboard'
import { Breadcrumbs } from '../Breadcrumbs'
import { PropertiesProvider, TenantsProvider } from '../firebase/Collection'
import './styles.scss'

class App extends Component {
  state = {
    isOpen: true,
  }
  handleMenuClick = () => this.setState(({ isOpen }) => ({ isOpen: !isOpen }))
  render() {
    const { isOpen } = this.state
    return (
      <PropertiesProvider>
        <TenantsProvider>
          <div className="App">
            <Drawer isOpen={isOpen} />
            <DrawerAppContent className="DrawerAppContent">
              <AppBar onMenuClick={this.handleMenuClick} />
              <div className="Content">
                <Router>
                  <Dashboard path="/">
                    <Breadcrumbs path="property/:p">
                      <Breadcrumbs path="unit/:u" />
                    </Breadcrumbs>
                  </Dashboard>
                  {/* <NewProperty path="new-property" />
              <NewTenant path="new-tenant" /> */}
                </Router>
              </div>
            </DrawerAppContent>
          </div>
        </TenantsProvider>
      </PropertiesProvider>
    )
  }
}

export default App
