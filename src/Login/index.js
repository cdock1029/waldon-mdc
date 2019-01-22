import React, { useEffect, useState } from 'react'
import styled from '@emotion/styled'
import { Link } from '@reach/router'
import {
  FormGroup,
  H2,
  InputGroup,
  Intent,
  Button,
  H3,
} from '@blueprintjs/core'
import firebase from '../firebase'
import { useInput } from '../utils/useInput'

export function Login() {
  const [showSignUp, setShowSignUp] = useState(false)
  const [showReset, setShowReset] = useState(false)

  useEffect(() => {
    document.querySelector('body').classList.add('darken')
    return () => {
      document.querySelector('body').classList.remove('darken')
    }
  }, [])

  function showResetForm() {
    setShowReset(true)
  }
  function hideResetForm() {
    setShowReset(false)
  }
  return (
    <LoginPage>
      {showReset ? (
        <ResetPassword hideResetForm={hideResetForm} />
      ) : showSignUp ? (
        <SimpleSignup showLogin={() => setShowSignUp(false)} />
      ) : (
        <SimpleLogin
          showSignUp={() => setShowSignUp(true)}
          showResetForm={showResetForm}
        />
      )}
    </LoginPage>
  )
}

function ResetPassword({ hideResetForm }) {
  const email = useInput('email')
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)
    const { value: emailValue } = email
    try {
      await firebase.auth().sendPasswordResetEmail(emailValue)
      setEmailSent(true)
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
      {emailSent ? (
        <div>
          <H3>Email has been sent.</H3>
          <p>Check your email to complete the password-reset process.</p>
        </div>
      ) : (
        <>
          <H2 style={{ margin: '1.5em 0 1em 0' }}>Reset password</H2>
          <div>{error && <p style={{ color: 'red' }}>{error}</p>}</div>
          <form onSubmit={handleSubmit}>
            <FormGroup label="Enter your email address" intent={Intent.PRIMARY}>
              <InputGroup
                {...email.input({
                  type: 'email',
                  required: true,
                  onFocus: resetError,
                })}
                className="bp3-fill"
                leftIcon="user"
                large
                placeholder="your@email.com"
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
                Send reset-email
              </Button>
            </ButtonRow>
          </form>
        </>
      )}

      <ButtonRow>
        <Link to="signin" onClick={hideResetForm}>
          Go back to sign-in
        </Link>
      </ButtonRow>
    </SimpleWrapper>
  )
}

function SimpleLogin({ showSignUp, showResetForm }) {
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
        <ButtonRow>
          <Link to="reset" onClick={showResetForm}>
            Reset password
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
          <Link to="signin" onClick={showLogin}>
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
