import React from 'react'
import styled from '@emotion/styled'
import { Router } from '@reach/router'
// import { TopAppBarFixedAdjust as MaterialTopAppBarFixedAdjust } from '@material/react-top-app-bar'
import { DrawerAppContent as MaterialDrawerAppContent } from '@material/react-drawer'
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
import Experiments from '../Experiments'

function App() {
  const [isOpen, toggleMenu] = useMenuToggle()
  return (
    <QueryProvider>
      <ErrorBoundary>
        <AppContainer>
          <Drawer isOpen={isOpen} />
          <DrawerAppContent>
            <AppBar onMenuClick={toggleMenu} />
            <TopAppBarFixedAdjust>
              <Content>
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
                  <Experiments path="exp" />
                </Router>
              </Content>
            </TopAppBarFixedAdjust>
          </DrawerAppContent>
        </AppContainer>
      </ErrorBoundary>
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
  overflow-y: hidden;
`
const DrawerAppContent = styled(MaterialDrawerAppContent)`
  label: DrawerAppContent;
  display: flex;
  flex-direction: column;
  flex: 1;
`
// const TopAppBarFixedAdjust = styled(MaterialTopAppBarFixedAdjust)`
const TopAppBarFixedAdjust = styled.div`
  label: TopAppBarFixedAdjust;
  display: flex;
  flex: 1;
  overflow-y: scroll;
`

const Content = styled.div`
  label: Content;
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  padding: 0 1.5em;
`

export default App
