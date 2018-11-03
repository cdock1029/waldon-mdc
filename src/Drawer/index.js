import React, { useState, useContext, lazy, Suspense } from 'react'
import {
  Drawer as D,
  DrawerHeader,
  DrawerContent,
  TabBar,
  Tab,
  Typography,
  Button,
  ButtonIcon,
  ThemeProvider,
} from 'rmwc'
import styled from 'styled-components/macro'
import { QueryContext } from '../Location'
import { EntityForm } from '../EntityForm'
import { MaterialField } from '../MaterialField'
import { PropertySchema } from '../firebase/schemas'
import { useLocalStorage } from '../utils/useLocalStorage'
import { PropertiesList } from './PropertiesList'
import { Spinner } from '../Spinner'

const TenantList = lazy(() => import('./TenantList'))
const NewTenantForm = lazy(() => import('./NewTenantForm'))

export function Drawer({ isOpen }) {
  const [tabIndex, setTabIndex] = useLocalStorage({
    key: 'drawer_tab',
    defaultValue: 0,
    transform: str => parseInt(str) || 0,
  })
  const [showForm, setShowForm] = useState(false)
  const q = useContext(QueryContext)

  function handleSetTabIndex(e) {
    const tabIndex = e.detail.index
    setTabIndex(tabIndex)
    setShowForm(false)
  }
  function toggleShowForm() {
    setShowForm(!showForm)
  }
  return (
    <StyledDrawer dismissible open={isOpen}>
      <DrawerHeader className="DrawerHeader">
        <ThemeProvider options={{ primary: 'white', onSurface: 'white' }} wrap>
          <TabBar
            className="darkTabBar"
            activeTabIndex={tabIndex}
            onActivate={handleSetTabIndex}
          >
            <Tab>Properties</Tab>
            <Tab>Tenants</Tab>
          </TabBar>
        </ThemeProvider>
      </DrawerHeader>
      <DrawerContent className="DrawerContent">
        {tabIndex === 0 ? (
          showForm ? (
            <EntityForm
              collectionPath="properties"
              initialValues={{ name: '' }}
              validationSchema={PropertySchema}
              onCancel={toggleShowForm}
            >
              <div className="title">
                <Typography use="headline5">New property</Typography>
              </div>
              <div>
                <MaterialField name="name" label="Property name" />
              </div>
            </EntityForm>
          ) : (
            <>
              <div className="DrawerControls">
                <div
                  style={{
                    padding: '1rem',
                    display: 'flex',
                    // justifyContent: 'flex-end',
                  }}
                >
                  <Button dense onClick={toggleShowForm}>
                    <ButtonIcon icon="add" />
                    New property
                  </Button>
                </div>
              </div>
              <Suspense fallback={<Spinner />}>
                <PropertiesList p={q.p} />
              </Suspense>
            </>
          )
        ) : showForm ? (
          <Suspense fallback={<Spinner />}>
            <NewTenantForm toggleShowForm={toggleShowForm} />
          </Suspense>
        ) : (
          <Suspense fallback={<Spinner />}>
            <TenantList t={q.t} toggleShowForm={toggleShowForm} />
          </Suspense>
        )}
      </DrawerContent>
    </StyledDrawer>
  )
}

const StyledDrawer = styled(D)`
  background-color: #e8e9eb;
  .DrawerHeader {
    display: flex;
    align-items: flex-end;
    background-color: #282c34;
    padding: 0;
  }
  .DrawerContent {
    overflow-y: hidden;
    display: flex;
    flex-direction: column;
  }
  .DrawerList {
    flex: 1;
    overflow-y: scroll;
  }
`
