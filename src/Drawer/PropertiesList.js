import React, { memo, useContext } from 'react'
import { List, ListItem } from 'rmwc'
import { Link } from '@reach/router'
import { Submenu } from '../Submenu'
import { NoData } from '../NoData'
import { PropertiesResource, UnitsResource } from '../firebase/Collection'
import { AuthContext } from '../firebase/Auth'
import { QueryContext } from '../Location'

export function PropertiesList({ p }) {
  const {
    claims: { activeCompany },
  } = useContext(AuthContext)
  const properties = PropertiesResource.read(activeCompany)
  return (
    <List className="DrawerList">
      {properties.map(property => {
        return (
          <PropertyItem
            key={property.id}
            {...property}
            propertyActivated={p === property.id}
          />
        )
      })}
    </List>
  )
}

const PropertyItem = memo(function PropertyItemComponent({
  propertyActivated,
  ...property
}) {
  const {
    claims: { activeCompany },
  } = useContext(AuthContext)
  const units = UnitsResource.read(activeCompany, property.id)
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
