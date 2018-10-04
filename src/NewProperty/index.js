import React from 'react'
import { NewEntityForm } from '../NewEntityForm'
import { MaterialField } from '../MaterialField'
import * as Yup from 'yup'
// import './styles.scss'

const PropertySchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Property name must be at least 2 characters in length')
    .max(100)
    .required('Property name is required'),
})

export class NewProperty extends React.Component {
  render() {
    return (
      <div>
        <h2>Add a new Property</h2>
        <NewEntityForm
          path="properties"
          initialValues={{ name: '' }}
          validationSchema={PropertySchema}
        >
          <div>
            <MaterialField name="propertyName" label="Property name" />
          </div>
        </NewEntityForm>
      </div>
    )
  }
}
