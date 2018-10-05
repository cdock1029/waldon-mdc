import React from 'react'
import { Button, ButtonIcon } from 'rmwc'
import { NewEntityForm } from '../NewEntityForm'
import { MaterialField } from '../MaterialField'
import { UnitSchema } from '../firebase/schemas'

export class NewSubUnit extends React.Component {
  render() {
    return (
      <Button outlined dense>
        <ButtonIcon icon="add" />
        New sub-unit
      </Button>
    )
  }
}
