import React, { useEffect, useState } from 'react'
import styled from '@emotion/styled'
import { FormGroup, H2, InputGroup, Intent, Button } from '@blueprintjs/core'
import firebase from '../firebase'

export function Login() {
  useEffect(() => {
    document.querySelector('body').classList.add('darken')
    return () => {
      document.querySelector('body').classList.remove('darken')
    }
  }, [])
  return (
    <LoginPage>
      <SimpleLogin />
    </LoginPage>
  )
}

function useInput(name, initial = '') {
  const [value, setValue] = useState(initial)

  function handleChange(e) {
    const { value } = e.target
    setValue(value)
  }

  return {
    input: (params = {}) => ({
      name,
      value,
      onChange: handleChange,
      type: 'text',
      ...params,
    }),
    value,
    reset() {
      setValue(initial)
    },
  }
}

function SimpleLogin() {
  const email = useInput('email')
  const password = useInput('password')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)
    const { value: emailValue } = email
    const { value: passwordValue } = password
    try {
      await firebase
        .auth()
        .signInWithEmailAndPassword(emailValue, passwordValue)
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
    <div
      style={{
        width: '350px',
        maxWidth: '350px',
        background: '#fff',
        padding: '0 2em',
        fontSize: '18px',
      }}
    >
      <H2 style={{ margin: '1.5em 0 1em 0' }}>Sign in</H2>
      <div>{error && <p style={{ color: 'red' }}>{error}</p>}</div>
      <form onSubmit={handleSubmit}>
        <FormGroup className="example" label="Email" intent={Intent.PRIMARY}>
          <InputGroup
            {...email.input({
              type: 'email',
              required: true,
              onFocus: resetError,
            })}
            className="bp3-fill"
            leftIcon="user"
            large
            placeholder="u@whatever.com"
            intent={Intent.PRIMARY}
          />
        </FormGroup>

        <FormGroup className="example" label="Password" intent={Intent.PRIMARY}>
          <InputGroup
            {...password.input({
              type: 'password',
              required: true,
              style: { fontSize: '18px' },
              onFocus: resetError,
            })}
            className="bp3-fill"
            leftIcon="lock"
            large
            placeholder="Enter password"
            intent={Intent.PRIMARY}
          />
        </FormGroup>
        <div
          style={{
            margin: '2em 0',
          }}
        >
          <Button
            disabled={isSubmitting}
            type="submit"
            intent={Intent.PRIMARY}
            large
          >
            Submit
          </Button>
        </div>
      </form>
    </div>
  )
}

const LoginPage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  padding-top: 10rem;
`
export default Login
