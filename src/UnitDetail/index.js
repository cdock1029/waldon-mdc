import React, { useState } from 'react'
import { css } from 'react-emotion'
import { Button, IconButton, Typography } from 'rmwc'
import { navigate } from '@reach/router'
import { useDoc } from '../firebase/Doc'
import { deleteDoc } from '../firebase'
import { UnitSchema } from '../firebase/schemas'
import { EntityForm } from '../EntityForm'
import { MaterialField } from '../MaterialField'

export function UnitDetail({ propertyId, unitId }) {
  const [showUnitForm, setShowUnitForm] = useState(false)
  const data = useDoc({ path: `properties/${propertyId}/units/${unitId}` })
  function toggleShowUnitForm() {
    setShowUnitForm(!showUnitForm)
  }
  async function handleDelete() {
    console.log('handling delete unit')
    const result = window.confirm('Confirm DELETE?')
    if (result) {
      console.log({ result, propertyId, unitId })
      try {
        await deleteDoc({
          collectionPath: `properties/${propertyId}/units`,
          docId: unitId,
        })
        navigate(`/property/${propertyId}?p=${propertyId}`)
      } catch (e) {
        alert(e.message)
      }
    }
  }
  return !data ? null : (
    <div className={styles}>
      <div className="header">
        <div className="title-bar unit">
          <Typography use="headline6">{data.label}</Typography>
          <IconButton icon="edit" type="button" onClick={toggleShowUnitForm} />
        </div>
      </div>
      {showUnitForm && (
        <div className="darken">
          <EntityForm
            collectionPath={`properties/${propertyId}/units`}
            docId={unitId}
            initialValues={{ label: data.label }}
            validationSchema={UnitSchema}
            onCancel={toggleShowUnitForm}
          >
            <div className="form-header">
              <div className="title">
                <Typography use="headline5">Edit unit</Typography>
              </div>
              <Button type="button" dense onClick={handleDelete}>
                Delete
              </Button>
            </div>
            <div>
              <MaterialField name="label" label="Unit label" />
            </div>
          </EntityForm>
        </div>
      )}
    </div>
  )
}

const styles = css`
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title-bar.unit {
      margin: 1em 0;
      display: flex;
      align-items: center;
    }

    button {
      margin-left: 1em;
    }
  }
  /* .backdrop {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    .form-wrapper {
      padding: 0 2rem;
      background-color: #fff;
    }
    .form-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      button {
        color: var(--mdc-theme-error);
      }
    }
  } */
`
