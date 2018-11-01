import React, { useState, useContext, memo, lazy, Suspense } from 'react'
import {
  Drawer as D,
  DrawerHeader,
  DrawerContent,
  ListItem,
  List,
  TabBar,
  Tab,
  Typography,
  Button,
  ButtonIcon,
  ThemeProvider,
} from 'rmwc'
import { css } from 'react-emotion/macro'
import { Link } from '@reach/router'
import { PropertiesContext, useCollection } from '../firebase/Collection'
import { QueryContext } from '../Location'
import { EntityForm } from '../EntityForm'
import { MaterialField } from '../MaterialField'
import { Submenu } from '../Submenu'
import { NoData } from '../NoData'
import { PropertySchema } from '../firebase/schemas'
import { useLocalStorage } from '../utils/useLocalStorage'

const TenantList = lazy(() => import('./TenantList'))
const NewTenantForm = lazy(() => import('./NewTenantForm'))

export function Drawer({ isOpen }) {
  const [tabIndex, setTabIndex] = useLocalStorage({
    key: 'drawer_tab',
    defaultValue: 0,
    transform: str => parseInt(str) || 0,
  })
  const [showForm, setShowForm] = useState(false)
  const properties = useContext(PropertiesContext)
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
    <D dismissible open={isOpen} className={styles}>
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
              <List className="DrawerList">
                {properties
                  ? properties.map(property => {
                      return (
                        <PropertyItem
                          key={property.id}
                          {...property}
                          propertyActivated={q.p === property.id}
                        />
                      )
                    })
                  : null}
              </List>
            </>
          )
        ) : showForm ? (
          <Suspense fallback={<div />}>
            <NewTenantForm toggleShowForm={toggleShowForm} />
          </Suspense>
        ) : (
          <Suspense fallback={<div />}>
            <TenantList t={q.t} toggleShowForm={toggleShowForm} />
          </Suspense>
        )}
      </DrawerContent>
    </D>
  )
}

const PropertyItem = memo(function PropertyItemComponent({
  propertyActivated,
  ...property
}) {
  const units = useCollection({
    path: `properties/${property.id}/units`,
    options: { orderBy: ['label'] },
  })
  return (
    <Submenu
      activated={propertyActivated}
      label={property.name}
      tag={Link}
      to={`/property/${property.id}?p=${property.id}`}
    >
      {(() => {
        if (!propertyActivated || !units) {
          return null
        }
        if (!units.length) {
          return <NoData label="Units" />
        }
        return units.map(unit => (
          <UnitItem key={unit.id} {...unit} propertyId={property.id} />
        ))
      })()}
    </Submenu>
  )
})

const UnitItem = memo(function UnitItemComponent({ propertyId, ...unit }) {
  const { u } = useContext(QueryContext)
  return (
    <ListItem
      key={unit.id}
      tag={Link}
      to={`/property/${propertyId}/unit/${unit.id}?p=${propertyId}&u=${
        unit.id
      }`}
      onClick={() => window.scrollTo(0, 0)}
      activated={u === unit.id}
    >
      <span>{unit.label}</span>
    </ListItem>
  )
})

const styles = css`
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
