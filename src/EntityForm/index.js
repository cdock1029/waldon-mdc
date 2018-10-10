import React from 'react'
import { Formik, Form } from 'formik'
import { Button } from 'rmwc'
import { saveDoc } from '../firebase'
import styled, { css } from 'react-emotion/macro'

const FromWrapper = styled.div({
  label: 'FormWrapper',
  display: 'flex',
  flexDirection: 'column',
  padding: '1rem',
  '.title': { padding: '1.5rem 0' },
})

export class EntityForm extends React.Component {
  render() {
    const {
      collectionPath,
      initialValues,
      validationSchema,
      children,
      onCancel,
      docId,
    } = this.props
    return (
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting, setStatus }) => {
          setSubmitting(true)
          try {
            await saveDoc({
              collectionPath,
              data: Object.entries(values).reduce((acc, [key, val]) => {
                if (val || val === 0) {
                  acc[key] = val
                }
                return acc
              }, {}),
              docId,
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
          return (
            <FromWrapper>
              <Form className={newEntityStyles}>
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
                  <div className="status" onClick={() => setStatus(undefined)}>
                    {status}
                  </div>
                )}
              </Form>
            </FromWrapper>
          )
        }}
      </Formik>
    )
  }
}

const newEntityStyles = css`
  label: NewEntity;
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
