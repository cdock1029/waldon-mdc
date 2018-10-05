import React from 'react'
import {
  Drawer as D,
  DrawerHeader,
  DrawerContent,
  ListItem,
  List,
  TabBar,
  Tab,
  Fab,
} from 'rmwc'
import { Link } from '@reach/router'
import {
  Collection,
  PropertiesConsumer,
  TenantsConsumer,
} from '../firebase/Collection'
import { Location } from '../Location'
import { NewEntityForm } from '../NewEntityForm'
import { MaterialField } from '../MaterialField'
import { Submenu } from '../Submenu'
import { PropertySchema, TenantSchema } from '../firebase/schemas'
import './styles.scss'

const NoData = ({ label }) => (
  <div
    style={{
      padding: '1rem 2rem',
      border: '1px solid var(--mdc-theme-secondary)',
      borderRadius: '4px',
      margin: '1rem',
    }}
  >
    <p>NO {label}</p>
  </div>
)

export class Drawer extends React.Component {
  state = {
    tabIndex: 0,
    showForm: false,
  }
  setTabIndex = e => {
    const tabIndex = e.detail.index
    this.setState(() => ({ tabIndex, showForm: false }))
  }
  toggleShowForm = () =>
    this.setState(({ showForm }) => ({ showForm: !showForm }))
  render() {
    const { isOpen } = this.props
    const { tabIndex, showForm } = this.state
    return (
      <D dismissible open={isOpen} className="Drawer">
        <DrawerHeader className="DrawerHeader" />
        <DrawerContent className="DrawerContent">
          <TabBar activeTabIndex={tabIndex} onActivate={this.setTabIndex}>
            <Tab>Properties</Tab>
            <Tab>Tenants</Tab>
          </TabBar>
          {tabIndex === 0 ? (
            showForm ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <NewEntityForm
                  path="properties"
                  initialValues={{ propertyName: '' }}
                  validationSchema={PropertySchema}
                  onCancel={this.toggleShowForm}
                >
                  <div>
                    <h2>Add a new Property</h2>
                  </div>
                  <div>
                    <MaterialField name="propertyName" label="Property name" />
                  </div>
                </NewEntityForm>
              </div>
            ) : (
              <>
                <div className="DrawerControls">
                  <div
                    style={{
                      padding: '1rem',
                      display: 'flex',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Fab
                      style={{ backgroundColor: '#6200ee' }}
                      mini
                      icon="add"
                      onClick={this.toggleShowForm}
                    />
                  </div>
                </div>
                <List className="DrawerList">
                  <PropertiesConsumer>
                    {properties => {
                      return (
                        <Location>
                          {({ q }) =>
                            properties.map(property => {
                              const activated = q.p === property.id
                              const propertyPath = `/property/${property.id}`
                              return (
                                <Submenu
                                  activated={activated}
                                  label={property.name}
                                  key={property.id}
                                  tag={Link}
                                  to={`${propertyPath}?p=${property.id}`}
                                >
                                  {activated ? (
                                    <Collection
                                      path={`properties/${property.id}/units`}
                                      options={{ orderBy: ['label'] }}
                                    >
                                      {({ data }) => {
                                        if (!data.length) {
                                          return <NoData label="Units" />
                                        }
                                        return data.map(unit => (
                                          <ListItem
                                            key={unit.id}
                                            tag={Link}
                                            to={`${propertyPath}/unit/${
                                              unit.id
                                            }?p=${property.id}&u=${unit.id}`}
                                            onClick={() =>
                                              window.scrollTo(0, 0)
                                            }
                                            activated={q.u === unit.id}
                                          >
                                            <span>{unit.label}</span>
                                          </ListItem>
                                        ))
                                      }}
                                    </Collection>
                                  ) : null}
                                </Submenu>
                              )
                            })
                          }
                        </Location>
                      )
                    }}
                  </PropertiesConsumer>
                </List>
              </>
            )
          ) : showForm ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <NewEntityForm
                path="tenants"
                initialValues={{ firstName: '', lastName: '', email: '' }}
                validationSchema={TenantSchema}
                onCancel={this.toggleShowForm}
              >
                <div>
                  <h2>Add a new Tenant</h2>
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
              </NewEntityForm>
            </div>
          ) : (
            <>
              <div
                style={{
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <Fab
                  style={{ backgroundColor: '#6200ee' }}
                  mini
                  icon="add"
                  onClick={this.toggleShowForm}
                />
              </div>

              <List>
                <TenantsConsumer>
                  {tenants => {
                    return (
                      <Location>
                        {({ q }) =>
                          tenants.map(tenant => (
                            <ListItem
                              key={tenant.id}
                              tag={Link}
                              to={`/?t=${tenant.id}`}
                              activated={q.t === tenant.id}
                            >
                              {tenant.firstName} {tenant.lastName}
                            </ListItem>
                          ))
                        }
                      </Location>
                    )
                  }}
                </TenantsConsumer>
              </List>
            </>
          )}
        </DrawerContent>
      </D>
    )
  }
}
