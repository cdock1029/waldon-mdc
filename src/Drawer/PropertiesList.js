import React, {
  memo,
  useState,
  useEffect,
  useContext,
  Suspense,
  forwardRef,
} from 'react'
import Button from '@material/react-button'
import MaterialIcon from '@material/react-material-icon'
import List, { ListItem, ListItemText } from '@material/react-list'
import { unstable_scheduleCallback as scheduleCallback } from 'scheduler'
import { navigate } from '@reach/router'
import { Submenu } from '../Submenu'
import { NoData } from '../NoData'
import { PropertiesResource, UnitsResource } from '../firebase/Collection'
import { useActiveCompany } from '../firebase/Auth'
import { QueryContext } from '../Location'
import { Spinner } from '../Spinner'
import { sortUnits } from '../utils/index'

export function PropertiesList({ toggleShowForm }) {
  const activeCompany = useActiveCompany()
  const properties = PropertiesResource.read({ activeCompany })
  const { p } = useContext(QueryContext)

  const [quickItems, setQuickItems] = useState({ open: p, selected: p })

  useEffect(
    () => {
      scheduleCallback(() => {
        if (!p && quickItems.selected) {
          setQuickItems({ open: null, selected: null })
        }
      })
    },
    [p]
  )

  function handleItemClick(propertyId) {
    setQuickItems(({ open }) => ({
      selected: propertyId,
      open: open === propertyId ? null : propertyId,
    }))
    scheduleCallback(() => {
      const route = `/property/${propertyId}?p=${propertyId}`
      if (route !== window.location.pathname + window.location.search) {
        navigate(route)
      }
    })
  }

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
              selected={quickItems.selected === property.id}
              isOpen={quickItems.open === property.id}
              handleItemClick={() => handleItemClick(property.id)}
            />
          )
        })}
      </List>
    </>
  )
}

function propertyItemsAreEqual(prevProps, nextProps) {
  const areEqual =
    prevProps.name === nextProps.name &&
    prevProps.activated === nextProps.activated &&
    prevProps.selected === nextProps.selected &&
    prevProps.isOpen === nextProps.isOpen
  return areEqual
}
const PropertyItem = memo(
  forwardRef(
    ({ activated, selected, isOpen, handleItemClick, ...property }, ref) => {
      return (
        <Submenu
          ref={ref}
          activated={activated}
          selected={selected}
          text={property.name}
          handleItemClick={handleItemClick}
          isOpen={isOpen}
        >
          {activated ? (
            <Suspense fallback={<Spinner />} maxDuration={800}>
              <UnitsList propertyId={property.id} />
            </Suspense>
          ) : null}
        </Submenu>
      )
    }
  ),
  propertyItemsAreEqual
)

const UnitsList = memo(
  function UnitsListComponent({ propertyId }) {
    const activeCompany = useActiveCompany()
    let units = UnitsResource.read({
      activeCompany,
      propertyId,
    })
    units = sortUnits(units)
    const { u } = useContext(QueryContext)

    return (
      <div>
        {units.length ? (
          units.map(unit => (
            <UnitItem
              key={unit.id}
              {...unit}
              activated={u === unit.id}
              propertyId={propertyId}
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

const UnitItem = forwardRef(({ activated, propertyId, ...unit }, ref) => {
  const [isSelected, setIsSelected] = useState(activated)

  useEffect(
    () => {
      if (isSelected !== activated) {
        setIsSelected(activated)
      }
    },
    [activated]
  )

  function handleItemClick() {
    setIsSelected(true)
    scheduleCallback(() => {
      navigate(
        `/property/${propertyId}/unit/${unit.id}?p=${propertyId}&u=${unit.id}`
      )
    })
  }
  return (
    <ListItem
      ref={ref}
      key={unit.id}
      className={
        activated ? activatedClass : isSelected ? selectedClass : undefined
      }
      onClick={handleItemClick}
    >
      <ListItemText primaryText={unit.name} />
    </ListItem>
  )
})
const activatedClass = 'mdc-list-item--activated'
const selectedClass = 'mdc-list-item--selected'

const MAX_DURATION = 1000
export default props => {
  return (
    <Suspense
      fallback={<h2>Properties loading..</h2>}
      maxDuration={MAX_DURATION}
    >
      <PropertiesList {...props} />
    </Suspense>
  )
}
