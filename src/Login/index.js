import React, { useEffect, useState } from 'react'
import styled from '@emotion/styled'
import { Link } from '@reach/router'
import { FormGroup, H2, InputGroup, Intent, Button } from '@blueprintjs/core'
import firebase from '../firebase'
import { useInput } from '../utils/useInput'

export function Login() {
  const [showSignUp, setShowSignUp] = useState(false)

  useEffect(() => {
    document.querySelector('body').classList.add('darken')
    return () => {
      document.querySelector('body').classList.remove('darken')
    }
  }, [])
  return (
    <LoginPage>
      {showSignUp ? (
        <SimpleSignup showLogin={() => setShowSignUp(false)} />
      ) : (
        <SimpleLogin showSignUp={() => setShowSignUp(true)} />
      )}
    </LoginPage>
  )
}

function SimpleLogin({ showSignUp }) {
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
    <SimpleWrapper>
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
        <ButtonRow>
          <Button
            disabled={isSubmitting}
            type="submit"
            intent={Intent.PRIMARY}
            large
          >
            Submit
          </Button>
          <Link to="signup" onClick={showSignUp}>
            Sign up
          </Link>
        </ButtonRow>
      </form>
    </SimpleWrapper>
  )
}

function SimpleSignup({ showLogin }) {
  const email = useInput('email')
  const password = useInput('password')
  const password2 = useInput('password2')
  // const company = useInput('company')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (password.value !== password2.value && !error) {
    setError('Password fields must be equal')
  } else if (password.value === password2.value && error) {
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)
    const { value: emailValue } = email
    const { value: passwordValue } = password
    try {
      await firebase
        .auth()
        .createUserWithEmailAndPassword(emailValue, passwordValue)
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
    <SimpleWrapper>
      <H2 style={{ margin: '1.5em 0 1em 0' }}>Sign up</H2>
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
            placeholder="user@domain.com"
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
        <FormGroup
          className="example"
          label="Re-type Password"
          intent={Intent.PRIMARY}
        >
          <InputGroup
            {...password2.input({
              type: 'password',
              required: true,
              style: { fontSize: '18px' },
              onFocus: resetError,
            })}
            className="bp3-fill"
            leftIcon="lock"
            large
            placeholder="Re-type password"
            intent={Intent.PRIMARY}
          />
        </FormGroup>
        <ButtonRow>
          <Button
            disabled={isSubmitting || !!error}
            type="submit"
            intent={Intent.PRIMARY}
            large
          >
            Submit
          </Button>
          <Link to="login" onClick={showLogin}>
            Sign in
          </Link>
        </ButtonRow>
      </form>
    </SimpleWrapper>
  )
}

const LoginPage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  padding-top: 10rem;
`

const SimpleWrapper = styled.div`
  width: 350px;
  max-width: 350px;
  background: #fff;
  padding: 0 2em;
  font-size: 18px;
`

const ButtonRow = styled.div`
  margin: 2em 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export default Login
