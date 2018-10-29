import React, { useState } from 'react'
import { css } from 'react-emotion/macro'
import { Button, ButtonIcon, IconButton, Typography } from 'rmwc'
import { useDoc } from '../firebase/Doc'
import { UnitSchema, PropertySchema } from '../firebase/schemas'
import { EntityForm } from '../EntityForm'
import { MaterialField } from '../MaterialField'

export function PropertyDetail({ propertyId, children }) {
  const [showUnitForm, setShowUnitForm] = useState(false)
  const [showPropertyForm, setShowPropertyForm] = useState(false)

  // todo: should throw a promise....
  const data = useDoc({ path: `properties/${propertyId}` })
  function toggleShowUnitForm() {
    setShowUnitForm(!showUnitForm)
  }
  function toggleShowPropertyForm() {
    setShowPropertyForm(!showPropertyForm)
  }
  // todo: should be handled by suspense...
  if (!data) {
    return null
  }
  return (
    <div className={styles}>
      <div className="header">
        <div className="title-bar property">
          <Typography use="headline4">{data.name}</Typography>
          <IconButton
            icon="edit"
            type="button"
            onClick={toggleShowPropertyForm}
          />
        </div>
        <Button type="button" dense onClick={toggleShowUnitForm}>
          <ButtonIcon icon="add" />
          New sub-unit
        </Button>
      </div>
      {showUnitForm && (
        <div className="darken">
          <EntityForm
            collectionPath={`properties/${propertyId}/units`}
            initialValues={{ label: '' }}
            validationSchema={UnitSchema}
            onCancel={toggleShowUnitForm}
          >
            <div className="title">
              <Typography use="headline5">New sub unit</Typography>
            </div>
            <div>
              <MaterialField name="label" label="Unit label" />
            </div>
          </EntityForm>
        </div>
      )}
      {showPropertyForm && (
        <div className="darken">
          <EntityForm
            collectionPath="properties"
            docId={propertyId}
            initialValues={{ name: data.name }}
            validationSchema={PropertySchema}
            onCancel={toggleShowPropertyForm}
          >
            <div className="form-header">
              <div className="title">
                <Typography use="headline5">Edit property</Typography>
              </div>
              <Button type="button">Delete</Button>
            </div>
            <div>
              <MaterialField name="name" label="Property Name" />
            </div>
          </EntityForm>
        </div>
      )}
      {children}
    </div>
  )
}

const styles = css`
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1.5em;

    .title-bar.property {
      display: flex;
      align-items: center;
    }

    button {
      margin-left: 1em;
    }
  }
`
