import React, { memo, useContext, useState, Suspense } from 'react'
import List, { ListItem, ListItemText } from '@material/react-list'
import { navigate } from '@reach/router'
import { Submenu } from '../Submenu'
import { NoData } from '../NoData'
import { PropertiesResource, UnitsResource } from '../firebase/Collection'
import { AuthContext } from '../firebase/Auth'
import { QueryContext } from '../Location'

export function PropertiesList({ p }) {
  const {
    claims: { activeCompany },
  } = useContext(AuthContext)
  const properties = PropertiesResource.read({ activeCompany })
  const [selectedIndex, setSelectedIndex] = useState()
  function selectItem(i) {
    setSelectedIndex(i)
  }
  console.log({ selectedIndex })
  return (
    <List singleSelection className="DrawerList" selectedIndex={selectedIndex}>
      {properties.map((property, index) => {
        return (
          <PropertyItem
            key={property.id}
            {...property}
            selectItem={() => selectItem(index)}
            propertyActivated={p === property.id}
          />
        )
      })}
    </List>
  )
}

const PropertyItem = memo(function PropertyItemComponent({
  propertyActivated,
  selectItem,
  ...property
}) {
  const [activatedUnitIndex, setActivatedUnitIndex] = useState()
  function handleUnitClick(i) {
    setActivatedUnitIndex(i)
  }
  return (
    <Submenu
      activated={propertyActivated}
      text={property.name}
      onClick={() => {
        navigate(`/property/${property.id}?p=${property.id}`)
        selectItem()
        handleUnitClick(null)
      }}
    >
      {propertyActivated ? (
        <Suspense fallback={<span />}>
          <UnitsList
            propertyId={property.id}
            activatedUnitIndex={activatedUnitIndex}
            handleUnitClick={handleUnitClick}
          />
        </Suspense>
      ) : null}
    </Submenu>
  )
})

function UnitsList({ propertyId, activatedUnitIndex, handleUnitClick }) {
  const { activeCompany } = useContext(AuthContext).claims
  const units = UnitsResource.read({
    activeCompany,
    propertyId,
  })
  return (
    <div>
      {units.length ? (
        units.map((unit, index) => (
          <UnitItem
            key={unit.id}
            {...unit}
            activated={activatedUnitIndex === index}
            propertyId={propertyId}
            handleUnitClick={() => handleUnitClick(index)}
          />
        ))
      ) : (
        <NoData label="Units" />
      )}
    </div>
  )
}

const UnitItem = memo(function UnitItemComponent({
  activated,
  handleUnitClick,
  propertyId,
  ...unit
}) {
  return (
    <ListItem
      key={unit.id}
      className={activated ? activatedClass : undefined}
      onClick={() => {
        navigate(
          `/property/${propertyId}/unit/${unit.id}?p=${propertyId}&u=${unit.id}`
        )
        handleUnitClick()
        //window.scrollTo(0, 0)
      }}
    >
      <ListItemText primaryText={unit.label} />
    </ListItem>
  )
})
const activatedClass = ' mdc-list-item--activated'
