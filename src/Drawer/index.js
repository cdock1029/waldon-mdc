import React, { useState, lazy, Suspense } from 'react'
import Drawr, { DrawerHeader, DrawerContent } from '@material/react-drawer'
import Tab from '@material/react-tab'
import TabBar from '@material/react-tab-bar'
import styled from 'styled-components/macro'
import { useLocalStorage } from '../utils/useLocalStorage'
import { PropertiesList } from './PropertiesList'
import { Spinner } from '../Spinner'

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
        {tabIndex === 0 ? (
          showForm ? (
            <Suspense fallback={<Spinner />}>
              <NewPropertyForm toggleShowForm={toggleShowForm} />
            </Suspense>
          ) : (
            <Suspense fallback={<Spinner />}>
              <PropertiesList toggleShowForm={toggleShowForm} />
            </Suspense>
          )
        ) : showForm ? (
          <Suspense fallback={<Spinner />}>
            <NewTenantForm toggleShowForm={toggleShowForm} />
          </Suspense>
        ) : (
          <Suspense fallback={<Spinner />}>
            <TenantList toggleShowForm={toggleShowForm} />
          </Suspense>
        )}
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
