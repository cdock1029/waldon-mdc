import React from 'react'
import { css } from 'react-emotion/macro'
import { Button, ButtonIcon, IconButton, Elevation, Typography } from 'rmwc'
import { Doc } from '../firebase/Doc'
import { UnitSchema, PropertySchema } from '../firebase/schemas'
import { EntityForm } from '../EntityForm'
import { MaterialField } from '../MaterialField'

export class PropertyDetail extends React.Component {
  state = {
    showUnitForm: false,
    showPropertyForm: false,
  }
  toggleShowUnitForm = () => {
    this.setState(({ showUnitForm }) => ({ showUnitForm: !showUnitForm }))
  }
  toggleShowPropertyForm = () =>
    this.setState(({ showPropertyForm }) => ({
      showPropertyForm: !showPropertyForm,
    }))
  render() {
    const { propertyId, children } = this.props
    const { showUnitForm, showPropertyForm } = this.state
    return (
      <Doc path={`properties/${propertyId}`}>
        {({ data }) => (
          <div className={styles}>
            <div className="header">
              <div className="title-bar property">
                <Typography use="headline4">{data.name}</Typography>
                <IconButton
                  icon="edit"
                  type="button"
                  onClick={this.toggleShowPropertyForm}
                />
              </div>
              <Button type="button" dense onClick={this.toggleShowUnitForm}>
                <ButtonIcon icon="add" />
                New sub-unit
              </Button>
            </div>
            {showUnitForm && (
              <div className="backdrop darken">
                <Elevation className="form-wrapper" z={7}>
                  <EntityForm
                    collectionPath={`properties/${propertyId}/units`}
                    initialValues={{ label: '' }}
                    validationSchema={UnitSchema}
                    onCancel={this.toggleShowUnitForm}
                  >
                    <div>
                      <h2>Add a new sub unit</h2>
                    </div>
                    <div>
                      <MaterialField name="label" label="Unit label" />
                    </div>
                  </EntityForm>
                </Elevation>
              </div>
            )}
            {showPropertyForm && (
              <div className="backdrop darken">
                <Elevation className="form-wrapper" z={7}>
                  <EntityForm
                    collectionPath="properties"
                    docId={propertyId}
                    initialValues={{ name: data.name }}
                    validationSchema={PropertySchema}
                    onCancel={this.toggleShowPropertyForm}
                  >
                    <div>
                      <h2>Edit property</h2>
                    </div>
                    <div>
                      <MaterialField name="name" label="Property Name" />
                    </div>
                  </EntityForm>
                </Elevation>
              </div>
            )}
            {children}
          </div>
        )}
      </Doc>
    )
  }
}

const styles = css`
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title-bar.property {
      display: flex;
      align-items: center;
      margin-top: 1.5em;
    }

    button {
      margin-left: 1em;
    }
  }
  .backdrop {
    z-index: 1;
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
  }
`
