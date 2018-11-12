import React, { useState, lazy, Suspense } from 'react'
import Drawr, { DrawerHeader, DrawerContent } from '@material/react-drawer'
import Tab from '@material/react-tab'
import TabBar from '@material/react-tab-bar'
import styled from '@emotion/styled'
import { useLocalStorage } from '../utils/useLocalStorage'
import { Spinner } from '../Spinner'

const PropertiesList = lazy(() => import('./PropertiesList'))
const TenantList = lazy(() => import('./TenantList'))
const NewTenantForm = lazy(() => import('./NewTenantForm'))
const NewPropertyForm = lazy(() => import('./NewPropertyForm'))

export function Drawer({ isOpen }) {
  const [tabIndex, setTabIndex] = useLocalStorage({
    key: 'drawer_tab',
    defaultValue: 0,
    transform: str => parseInt(str) || 0,
  })
  const [showForm, setShowForm] = useState(false)

  function handleSetTabIndex(tabIndex) {
    setTabIndex(tabIndex)
    if (showForm) {
      setShowForm(false)
    }
  }
  function toggleShowForm() {
    setShowForm(!showForm)
  }
  return (
    <StyledDrawer dismissible open={isOpen}>
      <DrawerHeader className="DrawerHeader">
        <TabBar
          className="darkTabBar"
          activeIndex={tabIndex}
          handleActiveIndexUpdate={handleSetTabIndex}
        >
          <Tab>
            <span className="mdc-tab__text-label">Properties</span>
          </Tab>
          <Tab>
            <span className="mdc-tab__text-label">Tenants</span>
          </Tab>
        </TabBar>
      </DrawerHeader>
      <DrawerContent className="DrawerContent">
        <Suspense maxDuration={1000} fallback={<Spinner />}>
          {tabIndex === 0 ? (
            showForm ? (
              <NewPropertyForm toggleShowForm={toggleShowForm} />
            ) : (
              <PropertiesList toggleShowForm={toggleShowForm} />
            )
          ) : showForm ? (
            <NewTenantForm toggleShowForm={toggleShowForm} />
          ) : (
            <TenantList toggleShowForm={toggleShowForm} />
          )}
        </Suspense>
      </DrawerContent>
    </StyledDrawer>
  )
}

const StyledDrawer = styled(Drawr)`
  background-color: #e8e9eb;
  li.mdc-list-item {
    cursor: pointer;
  }
  .DrawerHeader {
    display: flex;
    align-items: flex-end;
    padding: 0;
  }
  .DrawerContent {
    flex: auto;
    overflow-y: hidden;
    display: flex;
    flex-direction: column;
  }
  .DrawerList {
    flex: 1;
    overflow-y: scroll;
  }
`
