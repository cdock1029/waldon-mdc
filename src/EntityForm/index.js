import React from 'react'
import { Formik, Form } from 'formik'
import { Button } from 'rmwc'
import { saveDoc } from '../firebase'
import './styles.scss'

export class EntityForm extends React.Component {
  render() {
    const {
      collectionPath,
      initialValues,
      validationSchema,
      children,
      onCancel,
      updateId,
    } = this.props
    return (
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting, setStatus }) => {
          setSubmitting(true)
          try {
            await saveDoc(
              collectionPath,
              Object.entries(values).reduce((acc, [key, val]) => {
                if (val || val === 0) {
                  acc[key] = val
                }
                return acc
              }, {}),
              updateId
            )
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
            <Form className="NewEntity">
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
          )
        }}
      </Formik>
    )
  }
}
