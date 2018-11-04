import React, { useState, useContext, useEffect, Suspense } from 'react'
import styled from 'styled-components/macro'
import { Typography } from 'rmwc'
import Button from '@material/react-button'
import IconButton from '@material/react-icon-button'
import MaterialIcon from '@material/react-material-icon'
import { PropertiesResource } from '../firebase/Collection'
import { AuthContext } from '../firebase/Auth'
import { UnitSchema, PropertySchema } from '../firebase/schemas'
import { EntityForm } from '../EntityForm'
import { MaterialField } from '../MaterialField'

export function PropertyDetail({ propertyId, children }) {
  const [showUnitForm, setShowUnitForm] = useState(false)
  const [showPropertyForm, setShowPropertyForm] = useState(false)
  const { activeCompany } = useContext(AuthContext).claims
  useEffect(() => {
    return () => console.log('unmounting property-detail')
  }, [])

  const property = PropertiesResource.read({
    activeCompany,
    propertyId,
  })
  function toggleShowUnitForm() {
    setShowUnitForm(!showUnitForm)
  }
  function toggleShowPropertyForm() {
    setShowPropertyForm(!showPropertyForm)
  }
  return (
    <PropertyDetailWrapper>
      <div className="header">
        <div className="title-bar property">
          <Typography use="headline4">{property.name}</Typography>
          <IconButton type="button" onClick={toggleShowPropertyForm}>
            <MaterialIcon icon="edit" />
          </IconButton>
        </div>
        <Button
          type="button"
          icon={<MaterialIcon icon="add" />}
          dense
          onClick={toggleShowUnitForm}
        >
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
            initialValues={{ name: property.name }}
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
    </PropertyDetailWrapper>
  )
}

const PropertyDetailWrapper = styled.div`
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

export default props => (
  <Suspense fallback={<h1>....</h1>}>
    <PropertyDetail {...props} />
  </Suspense>
)
