import React, { useContext, Suspense } from 'react'
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
import { useLocalStorage } from '../utils/useLocalStorage'
import { Spinner } from '../Spinner'

const Firestore = () => {
  const Comp = React.lazy(() => import('../TestFirestoreLoader'))
  return (
    <Suspense fallback={<Spinner />}>
      <Comp />
    </Suspense>
  )
}

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
                <Firestore path="firestore" />
                {/* <NewProperty path="new-property" />
              <NewTenant path="new-tenant" /> */}
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
const Loading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 5rem;
`

export default App
