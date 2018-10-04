import React from 'react'
import { Field } from 'formik'
import TextField, { HelperText, Input } from '@material/react-text-field'

export const MaterialField = ({ label, ...rest }) => {
  return (
    <Field {...rest}>
      {({ field, form: { touched, errors } }) => {
        return (
          <TextField
            className="textField"
            outlined
            helperText={
              touched[field.name] && errors[field.name] ? (
                <HelperText persistent className="helperText">
                  {errors[field.name]}
                </HelperText>
              ) : null
            }
            label={label}
          >
            <Input autoComplete="off" {...field} />
          </TextField>
        )
      }}
    </Field>
  )
}
