import React, { memo, useContext } from 'react'
import { Button, ButtonIcon, List, ListItem } from 'rmwc'
import { Link } from '@reach/router'
import { TenantsResource } from '../firebase/Collection'
import { AuthContext } from '../firebase/Auth'

const TenantList = ({ t, toggleShowForm }) => {
  const {
    claims: { activeCompany },
  } = useContext(AuthContext)
  const tenants = TenantsResource.read({ activeCompany }) //.getValue()
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
        {tenants.map(tenant => (
          <TenantItem
            key={tenant.id}
            {...tenant}
            tenantActivated={t === tenant.id}
          />
        ))}
      </List>
    </>
  )
}

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
