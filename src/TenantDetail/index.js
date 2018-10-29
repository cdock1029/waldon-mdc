import React, { useState } from 'react'
import { css } from 'react-emotion'
import { Button, IconButton, Typography } from 'rmwc'
import { navigate } from '@reach/router'
import { useDoc } from '../firebase/Doc'
import { deleteDoc } from '../firebase'
import { TenantSchema } from '../firebase/schemas'
import { EntityForm } from '../EntityForm'
import { MaterialField } from '../MaterialField'

export function TenantDetail({ tenantId }) {
  const [showTenantForm, setShowTenantForm] = useState(false)
  const data = useDoc({ path: `tenants/${tenantId}` })
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
  return !data ? null : (
    <div className={styles}>
      <div className="header">
        <div className="title">
          <div className="title-bar">
            <Typography use="headline4">
              {data.firstName} {data.lastName}
            </Typography>
            <IconButton
              type="button"
              icon="edit"
              onClick={toggleShowTenantForm}
            />
          </div>
          {data.email && <Typography use="subtitle1">{data.email}</Typography>}
        </div>
      </div>
      {showTenantForm && (
        <div className="backdrop darken">
          <EntityForm
            collectionPath="tenants"
            docId={tenantId}
            initialValues={{ ...data }}
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
    </div>
  )
}

const styles = css`
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
