import React from 'react'
import { css } from 'react-emotion'
import { Button, IconButton, Elevation, Typography } from 'rmwc'
import { navigate } from '@reach/router'
import { Doc } from '../firebase/Doc'
import { deleteDoc } from '../firebase'
import { UnitSchema } from '../firebase/schemas'
import { EntityForm } from '../EntityForm'
import { MaterialField } from '../MaterialField'

export class UnitDetail extends React.Component {
  state = {
    showUnitForm: false,
  }
  toggleShowUnitForm = () =>
    this.setState(({ showUnitForm }) => ({ showUnitForm: !showUnitForm }))
  handleDelete = async () => {
    const result = window.confirm('Confirm DELETE?')
    if (result) {
      const { propertyId, unitId } = this.props
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
  render() {
    const { propertyId, unitId } = this.props
    const { showUnitForm } = this.state
    return (
      <Doc path={`properties/${propertyId}/units/${unitId}`}>
        {({ data }) => (
          <div className={styles}>
            <div className="header">
              <div className="title-bar unit">
                <Typography use="headline6">{data.label}</Typography>
                <IconButton
                  icon="edit"
                  type="button"
                  onClick={this.toggleShowUnitForm}
                />
              </div>
            </div>
            {showUnitForm && (
              <div className="backdrop darken">
                <Elevation className="form-wrapper" z={7}>
                  <EntityForm
                    collectionPath={`properties/${propertyId}/units`}
                    docId={unitId}
                    initialValues={{ label: data.label }}
                    validationSchema={UnitSchema}
                    onCancel={this.toggleShowUnitForm}
                  >
                    <div className="form-header">
                      <h2>Edit unit</h2>
                      <Button type="button" dense onClick={this.handleDelete}>
                        Delete
                      </Button>
                    </div>
                    <div>
                      <MaterialField name="label" label="Unit label" />
                    </div>
                  </EntityForm>
                </Elevation>
              </div>
            )}
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

    .title-bar.unit {
      margin: 1em 0;
      display: flex;
      align-items: center;
    }

    button {
      margin-left: 1em;
    }
  }
  .backdrop {
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
  }
`
