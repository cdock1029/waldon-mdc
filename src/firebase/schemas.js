import * as Yup from 'yup'

export const UnitSchema = Yup.object().shape({
  label: Yup.string()
    .max(100)
    .required('Unit label is required'),
})

export const PropertySchema = Yup.object().shape({
  propertyName: Yup.string()
    .min(2, 'Property name must be at least 2 characters in length')
    .max(100)
    .required('Property name is required'),
})

export const TenantSchema = Yup.object().shape({
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
