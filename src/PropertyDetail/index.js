import React from 'react'
import { css } from 'react-emotion/macro'
import { Button, ButtonIcon, IconButton, Typography } from 'rmwc'
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
              <div className="darken">
                <EntityForm
                  collectionPath={`properties/${propertyId}/units`}
                  initialValues={{ label: '' }}
                  validationSchema={UnitSchema}
                  onCancel={this.toggleShowUnitForm}
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
                  onCancel={this.toggleShowPropertyForm}
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
