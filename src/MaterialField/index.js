import React from 'react'
import { Field } from 'formik'
import { TextField, TextFieldHelperText } from 'rmwc'
import { css, cx } from 'react-emotion/macro'

export const MaterialField = ({ label, className, ...rest }) => {
  return (
    <Field {...rest}>
      {({ field, form: { touched, errors } }) => {
        return (
          <div className={cx(fieldStyles, className)}>
            <TextField
              label={label}
              autoComplete="off"
              className="materialTextField"
              {...field}
            />
            <TextFieldHelperText persistent className="materialHelperText">
              {touched[field.name] && errors[field.name]
                ? errors[field.name]
                : null}
            </TextFieldHelperText>
          </div>
        )
      }}
    </Field>
  )
}

const fieldStyles = css`
  .materialTextField + .materialHelperText {
    color: red;
  }
`
