import React, { memo } from 'react'
import { Button, ButtonIcon, List, ListItem } from 'rmwc'
import { Link } from '@reach/router'
import { useCollection } from '../firebase/Collection'

const TenantList = memo(({ t, toggleShowForm }) => {
  const tenants = useCollection({ path: 'tenants' })
  return (
    <>
      <div
        style={{
          padding: '1rem',
          display: 'flex',
        }}
      >
        <Button dense onClick={toggleShowForm}>
          <ButtonIcon icon="add" />
          New tenant
        </Button>
      </div>

      <List>
        {tenants
          ? tenants.map(tenant => (
              <TenantItem
                key={tenant.id}
                {...tenant}
                tenantActivated={t === tenant.id}
              />
            ))
          : null}
      </List>
    </>
  )
})

const TenantItem = memo(function TenantItemComponent({
  tenantActivated,
  ...tenant
}) {
  return (
    <ListItem
      tag={Link}
      to={`/tenant/${tenant.id}?t=${tenant.id}`}
      activated={tenantActivated}
    >
      {tenant.firstName} {tenant.lastName}
    </ListItem>
  )
})

export default TenantList
