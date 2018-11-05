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
import { navigate } from '@reach/router'
import { Submenu } from '../Submenu'
import { NoData } from '../NoData'
import { PropertiesResource, UnitsResource } from '../firebase/Collection'
import { useActiveCompany } from '../firebase/Auth'
import { QueryContext } from '../Location'

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
              /* ...property */
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
    prevProps.name === nextProps.name &&
    prevProps.activated === nextProps.activated &&
    prevProps.selected === nextProps.selected
  return areEqual
}
const PropertyItem = memo(
  forwardRef(({ activated, ...property }, ref) => {
    const [selected, setSelectd] = useState(activated)
    useEffect(
      () => {
        if (selected !== activated) {
          setSelectd(activated)
        }
      },
      [activated]
    )

    function handleItemClick() {
      setSelectd(true)
      setTimeout(() => {
        navigate(`/property/${property.id}?p=${property.id}`)
      }, 0)
    }
    return (
      <Submenu
        ref={ref}
        activated={activated}
        selected={selected}
        text={property.name}
        handleItemClick={handleItemClick}
      >
        {activated ? (
          <Suspense fallback={<div>....</div>} maxDuration={1000}>
            <UnitsList propertyId={property.id} />
          </Suspense>
        ) : null}
      </Submenu>
    )
  }),
  propertyItemsAreEqual
)

const UnitsList = memo(
  function UnitsListComponent({ propertyId }) {
    const activeCompany = useActiveCompany()
    const units = UnitsResource.read({
      activeCompany,
      propertyId,
    })
    const { u } = useContext(QueryContext)

    return (
      <div>
        {units.length ? (
          units.map((unit, i) => (
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
    setTimeout(() => {
      navigate(
        `/property/${propertyId}/unit/${unit.id}?p=${propertyId}&u=${unit.id}`
      )
    }, 0)
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
      <ListItemText primaryText={unit.label} />
    </ListItem>
  )
})
const activatedClass = 'mdc-list-item--activated'
const selectedClass = 'mdc-list-item--selected'
