import React from 'react'
import { Formik, Form } from 'formik'
import { Button } from 'rmwc'
import { createDoc } from '../firebase'
import './styles.scss'

export class NewEntityForm extends React.Component {
  render() {
    const { path, initialValues, validationSchema, children } = this.props
    return (
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting, setStatus }) => {
          setSubmitting(true)
          try {
            await createDoc(path, values)
            setStatus('Success!')
          } catch (e) {
            setStatus(e.message)
          } finally {
            setSubmitting(false)
          }
        }}
      >
        {({ status, setStatus, isValid, isSubmitting }) => {
          return (
            <Form className="NewEntity">
              {children}
              <div>
                <Button type="submit" disabled={!isValid || isSubmitting}>
                  Save
                </Button>
              </div>
              {status && (
                <div onClick={() => setStatus(undefined)}>{status}</div>
              )}
            </Form>
          )
        }}
      </Formik>
    )
  }
}