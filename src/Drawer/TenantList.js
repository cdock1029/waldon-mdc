import React, { memo, useState, useEffect, useContext, forwardRef } from 'react'
import Button from '@material/react-button'
import MaterialIcon from '@material/react-material-icon'
import List, { ListItem, ListItemText } from '@material/react-list'
import { navigate } from '@reach/router'
import { TenantsResource } from '../firebase/Collection'
import { useActiveCompany } from '../firebase/Auth'
import { QueryContext } from '../Location'

const TenantList = memo(
  ({ toggleShowForm }) => {
    const activeCompany = useActiveCompany()
    const tenants = TenantsResource.read({ activeCompany })
    const { t } = useContext(QueryContext)

    // function handleItemClick(tenantId) {
    //   const route = `/tenant/${tenantId}?t=${tenantId}`
    //   if (route !== window.location.pathname + window.location.search) {
    //     navigate(route)
    //   }
    // }

    return (
      <>
        <div
          style={{
            padding: '1rem',
            display: 'flex',
          }}
        >
          <Button
            icon={<MaterialIcon icon="add" />}
            dense
            onClick={toggleShowForm}
          >
            New tenant
          </Button>
        </div>

        <List>
          {tenants.map(tenant => (
            <TenantItem
              key={tenant.id}
              {...tenant}
              activated={t === tenant.id}
            />
          ))}
        </List>
      </>
    )
  },
  () => true
)

function areTenantItemsEqual(prev, next) {
  return (
    prev.id === next.id &&
    prev.activated === next.activated &&
    prev.firstName === next.firstName &&
    prev.lastName === next.lastName
  )
}
const TenantItem = memo(
  forwardRef(({ activated, ...tenant }, ref) => {
    const [visuallySelected, setVisuallySelected] = useState(activated)
    useEffect(
      () => {
        if (activated !== visuallySelected) {
          setVisuallySelected(activated)
        }
      },
      [activated]
    )

    function handleItemClick() {
      setVisuallySelected(true)
      const route = `/tenant/${tenant.id}?t=${tenant.id}`
      if (route !== window.location.pathname + window.location.search) {
        setTimeout(() => {
          navigate(route)
        }, 0)
      }
    }
    return (
      <ListItem
        ref={ref}
        className={
          activated
            ? activatedClass
            : visuallySelected
              ? selectedClass
              : undefined
        }
        onClick={handleItemClick}
      >
        <ListItemText primaryText={`${tenant.firstName} ${tenant.lastName}`} />
      </ListItem>
    )
  }),
  areTenantItemsEqual
)

const activatedClass = 'mdc-list-item--activated'
const selectedClass = 'mdc-list-item--selected'

export default TenantList
