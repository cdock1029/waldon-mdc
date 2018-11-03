import React from 'react'
import { Field } from 'formik'
import { TextField, TextFieldHelperText } from 'rmwc'
import styled from 'styled-components/macro'

export const MaterialField = ({ label, className, ...rest }) => {
  return (
    <Field {...rest}>
      {({ field, form: { touched, errors } }) => {
        return (
          <FieldWrapper className={className}>
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
          </FieldWrapper>
        )
      }}
    </Field>
  )
}

const FieldWrapper = styled.div`
  .materialTextField + .materialHelperText {
    color: red;
    max-width: 10.5rem;
    overflow-wrap: break-word;
  }
`
