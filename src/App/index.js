import React from 'react'
import styled from 'styled-components/macro'
import { Router } from '@reach/router'
import { DrawerAppContent } from 'rmwc'
import { AppBar } from '../AppBar'
import { Drawer } from '../Drawer'
import { Dashboard } from '../Dashboard'
import { ErrorBoundary } from '../ErrorBoundary'
import PropertyDetail from '../PropertyDetail'
import { UnitDetail } from '../UnitDetail'
import TenantDetail from '../TenantDetail'
import { QueryProvider } from '../Location'
import { useLocalStorage } from '../utils/useLocalStorage'
import Firestore from '../TestFirestoreLoader'

function App() {
  const [isOpen, toggleMenu] = useMenuToggle()
  return (
    <QueryProvider>
      <AppContainer>
        <Drawer isOpen={isOpen} />
        <ErrorBoundary>
          <DrawerAppContent className="DrawerAppContent">
            <AppBar onMenuClick={toggleMenu} />
            <div className="Content">
              <Router>
                <Dashboard path="/" key="dashboard">
                  <PropertyDetail
                    path="property/:propertyId"
                    key="property-detail"
                  >
                    <UnitDetail path="unit/:unitId" />
                  </PropertyDetail>
                  <TenantDetail path="tenant/:tenantId" />
                </Dashboard>
                <Firestore path="firestore" />
              </Router>
            </div>
          </DrawerAppContent>
        </ErrorBoundary>
      </AppContainer>
    </QueryProvider>
  )
}

function useMenuToggle() {
  const [isOpen, setIsOpen] = useLocalStorage({
    key: 'menu_is_open',
    transform: str => str === 'true',
  })
  function toggleMenu() {
    setIsOpen(!isOpen)
  }

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
export default App
