import React, { useState } from 'react'
import styled from 'styled-components/macro'
import { Typography } from 'rmwc'
import Button from '@material/react-button'
import IconButton from '@material/react-icon-button'
import MaterialIcon from '@material/react-material-icon'
import { navigate } from '@reach/router'
import { TenantsResource } from '../firebase/Collection'
import { useActiveCompany } from '../firebase/Auth'
import { deleteDoc } from '../firebase'
import { TenantSchema } from '../firebase/schemas'
import { EntityForm } from '../EntityForm'
import { MaterialField } from '../MaterialField'

// TODO: updatedAt covers all ??? (cloud function required?)
function areTenantsEqual(a, b) {
  return (
    a.id === b.id && a.firstName === b.firstName && a.lastName === b.lastName
  )
}
export function TenantDetail({ tenantId }) {
  const [showTenantForm, setShowTenantForm] = useState(false)
  const activeCompany = useActiveCompany()
  const tenant = TenantsResource.read(
    { activeCompany, tenantId },
    areTenantsEqual
  )
  function toggleShowTenantForm() {
    setShowTenantForm(!showTenantForm)
  }
  async function handleDelete() {
    const result = window.confirm('Confirm DELETE?')
    if (result) {
      console.log({ result, tenantId })
      try {
        await deleteDoc({ collectionPath: 'tenants', docId: tenantId })
        navigate('/')
      } catch (e) {
        alert(e.message)
      }
    }
  }
  return (
    <TenantsDetailWrapper>
      <div className="header">
        <div className="title">
          <div className="title-bar">
            <Typography use="headline4">
              {tenant.firstName} {tenant.lastName}
            </Typography>
            <IconButton type="button" onClick={toggleShowTenantForm}>
              <MaterialIcon icon="edit" />
            </IconButton>
          </div>
          {tenant.email && (
            <Typography use="subtitle1">{tenant.email}</Typography>
          )}
        </div>
      </div>
      {showTenantForm && (
        <div className="backdrop darken">
          <EntityForm
            collectionPath="tenants"
            docId={tenantId}
            initialValues={{ ...tenant }}
            validationSchema={TenantSchema}
            onCancel={toggleShowTenantForm}
          >
            <div className="form-header">
              <div className="title">
                <Typography use="headline5">Edit tenant</Typography>
              </div>
              <Button type="button" dense onClick={handleDelete}>
                Delete
              </Button>
            </div>
            <div>
              <MaterialField name="firstName" label="First name" />
            </div>
            <div>
              <MaterialField name="lastName" label="Last name" />
            </div>
            <div>
              <MaterialField name="email" type="email" label="Email" />
            </div>
          </EntityForm>
        </div>
      )}
    </TenantsDetailWrapper>
  )
}

const TenantsDetailWrapper = styled.div`
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      margin: 1.5em 0;
    }
    .title-bar {
      display: flex;
      align-items: center;
    }

    button {
      margin-left: 1em;
    }
  }
  .backdrop {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    .form-wrapper {
      padding: 0 2rem;
      background-color: #fff;
    }
    .form-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      button {
        color: var(--mdc-theme-error);
      }
    }
  }
`
export default props => (
  <React.Suspense fallback={null}>
    <TenantDetail {...props} />
  </React.Suspense>
)
