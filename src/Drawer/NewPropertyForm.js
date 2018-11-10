import React, { useContext } from 'react'
import { Typography } from 'rmwc'
import { EntityForm } from '../EntityForm'
import { PropertySchema } from '../firebase/schemas'
import { MaterialField } from '../MaterialField'
import { AuthContext } from '../firebase/Auth'

export function NewPropertyForm({ toggleShowForm }) {
  const { activeCompany } = useContext(AuthContext).claims
  return (
    <EntityForm
      rootPath={`/companies/${activeCompany}/properties`}
      initialValues={{ name: '' }}
      validationSchema={PropertySchema}
      onCancel={toggleShowForm}
    >
      <div className="title">
        <Typography use="headline5">New property</Typography>
      </div>
      <div>
        <MaterialField name="name" label="Property name" />
      </div>
    </EntityForm>
  )
}

export default NewPropertyForm
