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

export const Drawer = props => (
  <D dismissible open={props.isOpen}>
    <DrawerHeader>
      <DrawerTitle>DrawerHeader</DrawerTitle>
      <DrawerSubtitle>Subtitle</DrawerSubtitle>
    </DrawerHeader>
    <DrawerContent>
      <List>
        <ListItem>Cookies</ListItem>
        <ListItem>Pizza</ListItem>
        <ListItem>Icecream</ListItem>
      </List>
    </DrawerContent>
  </D>
)
