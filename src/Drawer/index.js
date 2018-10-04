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
import * as Yup from 'yup'
import { Collection } from '../Collection'
import { Location } from '../Location'
import { NewEntityForm } from '../NewEntityForm'
import { MaterialField } from '../MaterialField'
import './styles.scss'

const PropertySchema = Yup.object().shape({
  propertyName: Yup.string()
    .min(2, 'Property name must be at least 2 characters in length')
    .max(100)
    .required('Property name is required'),
})

const TenantSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 letters')
    .max(100)
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 letters')
    .max(100)
    .required('Last name is required'),
  email: Yup.string().email('Must be a valid email address'),
})

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
                    // onClick={() => navigate('/new-property')}
                    onClick={this.toggleShowForm}
                  />
                </div>
                <List>
                  <Collection path="properties" options={{ orderBy: ['name'] }}>
                    {({ data }) => {
                      console.log('render Properties')
                      return (
                        <Location>
                          {({ q }) =>
                            data.map(property => (
                              <ListItem
                                tag={Link}
                                to={`/?p=${property.id}`}
                                activated={q.p === property.id}
                                key={property.id}
                              >
                                {property.name}
                              </ListItem>
                            ))
                          }
                        </Location>
                      )
                    }}
                  </Collection>
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
                  // onClick={() => navigate('/new-tenant')}
                  onClick={this.toggleShowForm}
                />
              </div>

              <List>
                <Collection path="tenants">
                  {({ data }) => {
                    console.log('render Tenants')
                    return (
                      <Location>
                        {({ q }) =>
                          data.map(tenant => (
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
                </Collection>
              </List>
            </>
          )}
        </DrawerContent>
      </D>
    )
  }
}
