import React, { useState, useContext, useEffect } from 'react'
import styled from 'react-emotion/macro'
import { Router } from '@reach/router'
import { DrawerAppContent } from 'rmwc'
import { AppBar } from '../AppBar'
import { Drawer } from '../Drawer'
import { Login } from '../Login'
import { Dashboard } from '../Dashboard'
import { ErrorBoundary } from '../ErrorBoundary'
import { PropertyDetail } from '../PropertyDetail'
import { UnitDetail } from '../UnitDetail'
import { TenantDetail } from '../TenantDetail'
import { QueryProvider } from '../Location'
import { AuthContext } from '../firebase/Auth'
import {
  PropertiesProvider /*, TenantsProvider*/,
} from '../firebase/Collection'

function App() {
  const [isOpen, toggleMenu] = useMenuToggle()
  const auth = useContext(AuthContext)
  if (typeof auth.user === 'undefined') {
    return (
      <Loading>
        <h3>Loading..</h3>
      </Loading>
    )
  } else if (auth.user === null) {
    return <Login />
  }
  return (
    <QueryProvider>
      <PropertiesProvider>
        {/* <TenantsProvider> */}
        <AppContainer>
          <Drawer isOpen={isOpen} />
          <ErrorBoundary>
            <DrawerAppContent className="DrawerAppContent">
              <AppBar onMenuClick={toggleMenu} />
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
        </AppContainer>
        {/* </TenantsProvider> */}
      </PropertiesProvider>
    </QueryProvider>
  )
}

function useMenuToggle() {
  const [isOpen, setIsOpen] = useState(
    localStorage.getItem('menu_is_open') === 'true'
  )
  function toggleMenu() {
    setIsOpen(!isOpen)
  }
  useEffect(
    () => {
      localStorage.setItem('menu_is_open', isOpen)
    },
    [isOpen]
  )
  return [isOpen, toggleMenu]
}

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  .DrawerAppContent {
    display: flex;
    flex-direction: column;
    flex: 1;
    .Content {
      flex: 1;
      position: relative;
      display: flex;
      flex-direction: column;
      overflow-y: scroll;
      padding: 0 1.5em;
    }
  }
`
const Loading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 5rem;
`

export default App
