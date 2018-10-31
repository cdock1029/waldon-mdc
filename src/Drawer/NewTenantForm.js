import React from 'react'
import { Typography } from 'rmwc'
import { EntityForm } from '../EntityForm'
import { TenantSchema } from '../firebase/schemas'
import { MaterialField } from '../MaterialField'

export default function NewTenantForm({ toggleShowForm }) {
  return (
    <EntityForm
      collectionPath="tenants"
      initialValues={{ firstName: '', lastName: '', email: '' }}
      validationSchema={TenantSchema}
      onCancel={toggleShowForm}
    >
      <div className="title">
        <Typography use="headline5">New tenant</Typography>
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
  )
}
