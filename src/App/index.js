import React, { Component } from 'react'
import { Router } from '@reach/router'
import { DrawerAppContent } from 'rmwc'
import { AppBar } from '../AppBar'
import { Drawer } from '../Drawer'
import { Dashboard } from '../Dashboard'
import { ErrorBoundary } from '../ErrorBoundary'
import { PropertyDetail } from '../PropertyDetail'
import { UnitDetail } from '../UnitDetail'
import { TenantDetail } from '../TenantDetail'
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
            <ErrorBoundary>
              <DrawerAppContent className="DrawerAppContent">
                <AppBar onMenuClick={this.handleMenuClick} />
                <div className="Content">
                  <Router>
                    <Dashboard path="/">
                      <PropertyDetail path="property/:propertyId">
                        <UnitDetail path="unit/:unitId" />
                      </PropertyDetail>
                      <TenantDetail path="tenant/:tenantId" />
                    </Dashboard>
                    {/* <NewProperty path="new-property" />
              <NewTenant path="new-tenant" /> */}
                  </Router>
                </div>
              </DrawerAppContent>
            </ErrorBoundary>
          </div>
        </TenantsProvider>
      </PropertiesProvider>
    )
  }
}

export default App
