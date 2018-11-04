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
    console.log('tenants length', tenants.length)

    const [visuallySelectedTenant, setVisuallySelectedTenant] = useState(t)
    useEffect(() => {
      if (!t && visuallySelectedTenant) {
        setVisuallySelectedTenant(undefined)
      }
    })
    function handleItemClick(tenantId) {
      setVisuallySelectedTenant(tenantId)
      const route = `/tenant/${tenantId}?t=${tenantId}`
      if (route !== window.location.pathname + window.location.search) {
        console.log('navigating')
        navigate(route)
      }
    }

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
              selected={visuallySelectedTenant === tenant.id}
              handleItemClick={() => handleItemClick(tenant.id)}
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
    prev.selected === next.selected &&
    prev.activated === next.activated &&
    prev.firstName === next.firstName &&
    prev.lastName === next.lastName
  )
}
const TenantItem = memo(
  forwardRef(({ activated, selected, handleItemClick, ...tenant }, ref) => {
    return (
      <ListItem
        ref={ref}
        className={
          activated ? activatedClass : selected ? selectedClass : undefined
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
