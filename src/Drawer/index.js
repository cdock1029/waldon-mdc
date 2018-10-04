import React from 'react'
import {
  Drawer as D,
  DrawerHeader,
  DrawerContent,
  // DrawerTitle,
  // DrawerSubtitle,
  ListItem,
  List,
  TabBar,
  Tab,
} from 'rmwc'
import { Collection } from '../Collection'
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
        <DrawerHeader>
          {/* <DrawerTitle>Properties</DrawerTitle>
      <DrawerSubtitle>ToDo</DrawerSubtitle> */}
          <TabBar activeTabIndex={tabIndex} onActivate={this.setTabIndex}>
            <Tab>Properties</Tab>
            <Tab>Tenants</Tab>
          </TabBar>
        </DrawerHeader>
        <DrawerContent className="DrawerContent">
          <List>
            {tabIndex === 0 ? (
              <Collection path="properties">
                {({ data }) => {
                  console.log('render Properties')
                  return data.map(property => (
                    <ListItem key={property.id}>{property.name}</ListItem>
                  ))
                }}
              </Collection>
            ) : (
              <Collection path="tenants">
                {({ data }) => {
                  console.log('render Tenants')
                  return data.map(tenant => (
                    <ListItem key={tenant.id}>
                      {tenant.firstName} {tenant.lastName}
                    </ListItem>
                  ))
                }}
              </Collection>
            )}
          </List>
        </DrawerContent>
      </D>
    )
  }
}
