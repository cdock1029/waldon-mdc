import React, { useState, useContext, Suspense } from 'react'
import styled from '@emotion/styled'
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
          <Typography use="headline4">
            {property.name} ({property.unitCount || 0})
          </Typography>
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
            rootPath={`/companies/${activeCompany}/properties/${propertyId}/units`}
            initialValues={{ name: '' }}
            validationSchema={UnitSchema}
            onCancel={toggleShowUnitForm}
          >
            <div className="title">
              <Typography use="headline5">New sub unit</Typography>
            </div>
            <div>
              <MaterialField name="name" label="Unit name" />
            </div>
          </EntityForm>
        </div>
      )}
      {showPropertyForm && (
        <div className="darken">
          <EntityForm
            rootPath={`/companies/${activeCompany}/properties`}
            path={propertyId}
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
