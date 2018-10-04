import React from 'react'
import { NewEntityForm } from '../NewEntityForm'
import { MaterialField } from '../MaterialField'
import * as Yup from 'yup'
// import './styles.scss'

const TenantSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 letters')
    .max(100)
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 letters')
    .max(100)
    .required('Last name is required'),
  email: Yup.string().email('Must be a valid email address'),
})

export class NewTenant extends React.Component {
  render() {
    return (
      <div>
        <h2>Add a new Tenant</h2>
        <NewEntityForm
          path="properties"
          initialValues={{ firstName: '', lastName: '', email: '' }}
          validationSchema={TenantSchema}
        >
          <div>
            <MaterialField name="firstName" label="First name" />
          </div>
          <div>
            <MaterialField name="lastName" label="Last name" />
          </div>
          <div>
            <MaterialField name="email" type="email" label="Email" />
          </div>
        </NewEntityForm>
      </div>
    )
  }
}
