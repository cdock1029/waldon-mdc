import React, { useState } from 'react'
import styled from '@emotion/styled'
import { Typography } from 'rmwc'
import Button from '@material/react-button'
import IconButton from '@material/react-icon-button'
import MaterialIcon from '@material/react-material-icon'
import { navigate } from '@reach/router'
import { UnitsResource } from '../firebase/Collection'
import { deleteDoc } from '../firebase'
import { UnitSchema } from '../firebase/schemas'
import { EntityForm } from '../EntityForm'
import { MaterialField } from '../MaterialField'
import { useActiveCompany } from '../firebase/Auth'

export function UnitDetail({ propertyId, unitId }) {
  const [showUnitForm, setShowUnitForm] = useState(false)
  const activeCompany = useActiveCompany()
  const unit = UnitsResource.read({
    activeCompany,
    propertyId,
    unitId,
  })
  function toggleShowUnitForm() {
    setShowUnitForm(!showUnitForm)
  }
  async function handleDelete() {
    const result = window.confirm('Confirm DELETE?')
    if (result) {
      try {
        await deleteDoc({
          path: `/companies/${activeCompany}/properties/${propertyId}/units/${unitId}`,
        })
        navigate(`/property/${propertyId}?p=${propertyId}`)
      } catch (e) {
        alert(e.message)
      }
    }
  }
  return (
    <UnitDetailWrapper>
      <div className="header">
        <div className="title-bar unit">
          <Typography use="headline6">{unit.label}</Typography>
          <IconButton type="button" onClick={toggleShowUnitForm}>
            <MaterialIcon icon="edit" />
          </IconButton>
        </div>
      </div>
      {showUnitForm && (
        <div className="darken">
          <EntityForm
            rootPath={`/companies/${activeCompany}/properties/${propertyId}/units`}
            path={unitId}
            initialValues={{ label: unit.label }}
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
    </UnitDetailWrapper>
  )
}

const UnitDetailWrapper = styled.div`
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
// export default props => (
//   <Suspense fallback={null}>
//     <UnitDetail {...props} />
//   </Suspense>
// )
