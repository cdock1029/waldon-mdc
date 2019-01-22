import React, { useState } from 'react'
import {
  Button,
  FormGroup,
  InputGroup,
  Intent,
  ButtonGroup,
} from '@blueprintjs/core'
import { saveDoc } from '../firebase'
import { useInput } from '../utils/useInput'

export default function CreateCompany({ signOut, user }) {
  const name = useInput('name')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  // const auth = useContext(AuthContext)
  // const user = auth.user

  // window.refreshMe = () => {
  //   user.getIdToken(true)
  // }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)
    const { value: nameValue } = name
    console.log('handleSubmit', { name: nameValue, createdBy: user.uid })
    try {
      await saveDoc({
        rootPath: 'companies',
        data: { name: nameValue, createdBy: user.uid },
      })
      console.log('Company saved. Updating user credentials...')
      // setTimeout(() => {
      //   console.log('refreshing token..')
      //   user.getIdToken(true)
      // }, 500)
    } catch (e) {
      setError(e.message)
      setIsSubmitting(false)
    }
  }
  function resetError() {
    if (error) {
      setError('')
    }
  }
  return (
    <div style={{ padding: '2em' }}>
      <h2>Enter your company information</h2>
      <form onSubmit={handleSubmit}>
        <FormGroup label="Company name" intent={Intent.PRIMARY}>
          <InputGroup
            {...name.input({
              required: true,
              onFocus: resetError,
            })}
            className="bp3-fill"
            leftIcon="user"
            large
            placeholder="Your company name"
            intent={Intent.PRIMARY}
          />
        </FormGroup>
        <ButtonGroup>
          <Button
            disabled={isSubmitting}
            type="submit"
            intent={Intent.PRIMARY}
            large
          >
            Save
          </Button>
          <Button large onClick={signOut}>
            Sign out
          </Button>
        </ButtonGroup>
      </form>
    </div>
  )
}
