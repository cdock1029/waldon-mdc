import React, {
  memo,
  useState,
  useMemo,
  useEffect,
  useContext,
  Suspense,
} from 'react'
import Button from '@material/react-button'
import MaterialIcon from '@material/react-material-icon'
import List, { ListItem, ListItemText } from '@material/react-list'
import { navigate } from '@reach/router'
import qs from 'query-string'
import { Submenu } from '../Submenu'
import { NoData } from '../NoData'
import { PropertiesResource, UnitsResource } from '../firebase/Collection'
import { useActiveCompany } from '../firebase/Auth'
import { QueryContext } from '../Location'

function getQueryParam(param) {
  const q = qs.parse(window.location.search)
  return q[param]
}

export function PropertiesList({ toggleShowForm }) {
  const activeCompany = useActiveCompany()
  const properties = PropertiesResource.read({ activeCompany })
  const { p } = useContext(QueryContext)
  return (
    <>
      <div className="DrawerControls">
        <div
          style={{
            padding: '1rem',
            display: 'flex',
            // justifyContent: 'flex-end',
          }}
        >
          <Button
            dense
            icon={<MaterialIcon icon="add" />}
            onClick={toggleShowForm}
          >
            New property
          </Button>
        </div>
      </div>
      <List className="DrawerList">
        {properties.map(property => {
          return (
            <PropertyItem
              key={property.id}
              {...property}
              activated={p === property.id}
            />
          )
        })}
      </List>
    </>
  )
}

function propertyItemsAreEqual(prevProps, nextProps) {
  const areEqual =
    prevProps.id === nextProps.id &&
    prevProps.name === nextProps.name &&
    prevProps.activated === nextProps.activated
  return areEqual
}
const PropertyItem = memo(function PropertyItemComponent({
  activated,
  ...property
}) {
  const [isActivated, setIsActivated] = useState(activated)
  if (isActivated !== activated) {
    setIsActivated(activated)
  }

  console.log('render propertyItem', property.id)
  return (
    <Submenu
      activated={isActivated}
      text={property.name}
      selectItem={() => {
        navigate(`/property/${property.id}?p=${property.id}`)
      }}
    >
      {activated ? (
        <Suspense fallback={<span />}>
          <UnitsList propertyId={property.id} />
        </Suspense>
      ) : null}
    </Submenu>
  )
},
propertyItemsAreEqual)

const UnitsList = memo(
  function UnitsListComponent({ propertyId }) {
    const activeCompany = useActiveCompany()
    const units = UnitsResource.read({
      activeCompany,
      propertyId,
    })
    const { u } = useContext(QueryContext)
    const [visuallySelectedUnit, setVisuallySelectedUnit] = useState()

    function handleItemClick(unitId) {
      setVisuallySelectedUnit(unitId)
      navigate(
        `/property/${propertyId}/unit/${unitId}?p=${propertyId}&u=${unitId}`
      )
    }

    console.log('render unitList u:', u)
    return (
      <div>
        {units.length ? (
          units.map((unit, i) => (
            <UnitItem
              key={unit.id}
              {...unit}
              activated={u === unit.id}
              selected={visuallySelectedUnit === unit.id}
              propertyId={propertyId}
              handleItemClick={() => handleItemClick(unit.id)}
            />
          ))
        ) : (
          <NoData label="Units" />
        )}
      </div>
    )
  },
  (prevProps, nextProps) => prevProps.propertyId === nextProps.propertyId
)

const UnitItem = function UnitItemComponent({
  activated,
  selected,
  propertyId,
  handleItemClick,
  ...unit
}) {
  const [isActivated, setIsActivated] = useState(activated)
  if (isActivated !== activated) {
    setIsActivated(activated)
  }
  return (
    <ListItem
      key={unit.id}
      className={
        isActivated ? activatedClass : selected ? selectedClass : undefined
      }
      onClick={handleItemClick}
    >
      <ListItemText primaryText={unit.label} />
    </ListItem>
  )
}
const activatedClass = 'mdc-list-item--activated '
const selectedClass = 'mdc-list-item--selected '
