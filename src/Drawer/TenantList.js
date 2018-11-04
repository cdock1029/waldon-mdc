import React, { memo, useState } from 'react'
import Button from '@material/react-button'
import MaterialIcon from '@material/react-material-icon'
// import { List, ListItem } from 'rmwc'
import List, { ListItem, ListItemText } from '@material/react-list'
import { navigate } from '@reach/router'
import { TenantsResource } from '../firebase/Collection'
import { useActiveCompany } from '../firebase/Auth'
import { useQueryParams } from '../Location'

const TenantList = ({ toggleShowForm }) => {
  const activeCompany = useActiveCompany()
  const tenants = TenantsResource.read({ activeCompany }) //.getValue()
  const { t } = useQueryParams([])
  const [activated, setActivated] = useState(t)
  function handleSelectItem(id) {
    setActivated(id)
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
            tenantActivated={activated === tenant.id}
            handleSelectItem={() => handleSelectItem(tenant.id)}
          />
        ))}
      </List>
    </>
  )
}

const TenantItem = memo(function TenantItemComponent({
  tenantActivated,
  handleSelectItem,
  ...tenant
}) {
  return (
    <ListItem
      className={tenantActivated ? activatedClass : undefined}
      onClick={() => {
        handleSelectItem()
        navigate(`/tenant/${tenant.id}?t=${tenant.id}`)
      }}
    >
      <ListItemText primaryText={`${tenant.firstName} ${tenant.lastName}`} />
    </ListItem>
  )
})

const activatedClass = ' mdc-list-item--activated'

export default TenantList
