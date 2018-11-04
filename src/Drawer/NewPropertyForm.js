import React from 'react'
import { Typography } from 'rmwc'
import { EntityForm } from '../EntityForm'
import { PropertySchema } from '../firebase/schemas'
import { MaterialField } from '../MaterialField'

export function NewPropertyForm({ toggleShowForm }) {
  return (
    <EntityForm
      collectionPath="properties"
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
