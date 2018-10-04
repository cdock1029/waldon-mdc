import React from 'react'
import {
  Drawer as D,
  DrawerHeader,
  DrawerContent,
  DrawerTitle,
  DrawerSubtitle,
  ListItem,
  List,
} from 'rmwc'
import { Collection } from '../Collection'

export const Drawer = props => (
  <D dismissible open={props.isOpen}>
    <DrawerHeader>
      <DrawerTitle>DrawerHeader</DrawerTitle>
      <DrawerSubtitle>Subtitle</DrawerSubtitle>
    </DrawerHeader>
    <DrawerContent>
      <Collection path="properties">
        {({ data }) => {
          return (
            <List>
              {data.map(property => (
                <ListItem key={property.id}>{property.name}</ListItem>
              ))}
            </List>
          )
        }}
      </Collection>
    </DrawerContent>
  </D>
)
