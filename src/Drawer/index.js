import React, { useState, useContext, memo } from 'react'
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
import { Link } from '@reach/router'
import {
  PropertiesContext,
  TenantsContext,
  useCollection,
} from '../firebase/Collection'
import { QueryContext } from '../Location'
import { EntityForm } from '../EntityForm'
import { MaterialField } from '../MaterialField'
import { Submenu } from '../Submenu'
import { NoData } from '../NoData'
import { PropertySchema, TenantSchema } from '../firebase/schemas'
import { css } from 'react-emotion/macro'

export function Drawer({ isOpen }) {
  const [tabIndex, setTabIndex] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const properties = useContext(PropertiesContext)
  const tenants = useContext(TenantsContext)
  const q = useContext(QueryContext)

  function handleSetTabIndex(e) {
    const tabIndex = e.detail.index
    console.log('handle tab:', tabIndex)
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
          <EntityForm
            collectionPath="tenants"
            initialValues={{ firstName: '', lastName: '', email: '' }}
            validationSchema={TenantSchema}
            onCancel={toggleShowForm}
          >
            <div className="title">
              <Typography use="headline5">New tenant</Typography>
            </div>
            <div>
              <MaterialField name="firstName" label="First name" />
            </div>
            <div>
              <MaterialField name="lastName" label="Last name" />
            </div>
            <div>
              <MaterialField name="email" type="email" label="Email" />
            </div>
          </EntityForm>
        ) : (
          <>
            <div
              style={{
                padding: '1rem',
                display: 'flex',
                // justifyContent: 'flex-end',
              }}
            >
              {/* <Fab
                  style={{ backgroundColor: '#6200ee' }}
                  mini
                  icon="add"
                  onClick={toggleShowForm}
                /> */}
              <Button dense onClick={toggleShowForm}>
                <ButtonIcon icon="add" />
                New tenant
              </Button>
            </div>

            <List>
              {tenants.map(tenant => (
                <TenantItem
                  key={tenant.id}
                  {...tenant}
                  tenantActivated={q.t === tenant.id}
                />
              ))}
            </List>
          </>
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

const TenantItem = memo(function TenantItemComponent({
  tenantActivated,
  ...tenant
}) {
  return (
    <ListItem
      tag={Link}
      to={`/tenant/${tenant.id}?t=${tenant.id}`}
      activated={tenantActivated}
    >
      {tenant.firstName} {tenant.lastName}
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
