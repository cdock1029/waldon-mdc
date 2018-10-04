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
import { navigate, Link } from '@reach/router'
import { Collection } from '../Collection'
import { Location } from '../Location'
import './styles.scss'

export class Drawer extends React.Component {
  state = {
    tabIndex: 0,
  }
  setTabIndex = e => {
    const tabIndex = e.detail.index
    this.setState(() => ({ tabIndex }))
  }
  render() {
    const { isOpen } = this.props
    const { tabIndex } = this.state
    return (
      <D dismissible open={isOpen} className="Drawer">
        <DrawerHeader
          style={{ backgroundColor: 'var(--mdc-theme-primary)/*#6200ee*/' }}
        >
          {/* <DrawerTitle>Properties</DrawerTitle>
          <DrawerSubtitle>ToDo</DrawerSubtitle> */}
        </DrawerHeader>
        <DrawerContent className="DrawerContent">
          <TabBar activeTabIndex={tabIndex} onActivate={this.setTabIndex}>
            <Tab>Properties</Tab>
            <Tab>Tenants</Tab>
          </TabBar>
          {tabIndex === 0 ? (
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
                  onClick={() => navigate('/new-property')}
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
          ) : (
            <>
              <div
                style={{
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                {/* <IconButton icon="add" label="Add new tenant" /> */}
                <Fab
                  style={{ backgroundColor: '#6200ee' }}
                  mini
                  icon="add"
                  onClick={() => navigate('/new-tenant')}
                />
                {/* <Button dense outlined>
                  <ButtonIcon icon="add" /> Add
                </Button> */}
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
