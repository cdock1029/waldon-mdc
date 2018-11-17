import React from 'react'
import { Formik, Field, Form, FieldArray } from 'formik'

export default function Experiments() {
  return (
    <div>
      <p>todo</p>
      <Formik
        initialValues={{ one: '', two: '', things: [] }}
        onSubmit={values => {
          console.log('submit', { values })
        }}
      >
        {({ values }) => {
          return (
            <div>
              <Form>
                <div>
                  <label>One</label>
                  <Field name="one" />
                </div>
                <div>
                  <label>Two</label>
                  <Field name="two" />
                </div>
                <div>
                  <FieldArray name="things">
                    {({ insert, remove, push }) => {
                      return (
                        <div>
                          <label>Things</label>
                          <div>
                            {values.things.map((thing, i) => {
                              return (
                                <div key={i}>
                                  <div>
                                    <label>Label</label>
                                    <Field name={`things[${i}].label`} />
                                  </div>
                                  <div>
                                    <label>Value</label>
                                    <Field name={`things[${i}].value`} />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => push({ label: '', value: '' })}
                            >
                              Add thing
                            </button>
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() =>
                                insert(0, { label: '', value: '' })
                              }
                            >
                              Insert thing
                            </button>
                          </div>
                        </div>
                      )
                    }}
                  </FieldArray>
                </div>
                <button type="submit">Submit</button>
              </Form>
            </div>
          )
        }}
      </Formik>
    </div>
  )
}
