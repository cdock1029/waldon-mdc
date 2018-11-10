import React, { useContext } from 'react'
import { Typography } from 'rmwc'
import { EntityForm } from '../EntityForm'
import { TenantSchema } from '../firebase/schemas'
import { MaterialField } from '../MaterialField'
import { AuthContext } from '../firebase/Auth'

export default function NewTenantForm({ toggleShowForm }) {
  const { activeCompany } = useContext(AuthContext).claims
  return (
    <EntityForm
      rootPath={`/companies/${activeCompany}/tenants`}
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
