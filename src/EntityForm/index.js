import React from 'react'
import { Formik, Form } from 'formik'
import { Elevation } from 'rmwc'
import Button from '@material/react-button'
import { Padding } from '../widgets/Padding'
import { saveDoc } from '../firebase'
import styled from '@emotion/styled'

const FormWrapper = styled.div({
  label: 'FormWrapper',
  backgroundColor: '#fff',
  display: 'flex',
  flexDirection: 'column',
  padding: '1rem',
  '.title': { padding: '1.5rem 0', display: 'inline-flex' },
  '.form-header': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    button: {
      marginLeft: '1rem',
      color: 'var(--mdc-theme-error)',
    },
  },
})

export function EntityForm({
  rootPath,
  path,
  initialValues,
  validationSchema,
  children,
  onCancel,
  elevation = 6,
}) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting, setStatus }) => {
        setSubmitting(true)
        console.log({ values, rootPath, path })
        try {
          await saveDoc({
            rootPath,
            path,
            data: Object.entries(values).reduce((acc, [key, val]) => {
              if (val || val === 0) {
                acc[key] = val
              }
              return acc
            }, {}),
          })
          onCancel()
        } catch (e) {
          setStatus(e.message)
        } finally {
          setSubmitting(false)
        }
      }}
    >
      {({ status, setStatus, isValid, isSubmitting }) => {
        console.log('isValid:', isValid)
        return (
          <Padding padding="1rem">
            <Elevation className="form-elevation-card" z={elevation}>
              <FormWrapper>
                <StyledForm>
                  {children}
                  <div className="Buttons">
                    <Button type="button" onClick={onCancel}>
                      Cancel
                    </Button>
                    <Button
                      raised
                      type="submit"
                      disabled={!isValid || isSubmitting}
                    >
                      Save
                    </Button>
                  </div>
                  {status && (
                    <div
                      className="status"
                      onClick={() => setStatus(undefined)}
                    >
                      {status}
                    </div>
                  )}
                </StyledForm>
              </FormWrapper>
            </Elevation>
          </Padding>
        )
      }}
    </Formik>
  )
}

const StyledForm = styled(Form)`
  display: inline-flex;
  flex-direction: column;

  & > * {
    margin-bottom: 1em;
  }
  /* .helperText {
    color: red;
  } */
  .Buttons {
    margin-top: 1rem;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    & > button {
      margin-right: 1rem;
    }
  }
  .status {
    color: darkred;
    max-width: 20em;
    overflow-wrap: break-word;
  }
`
