import React, { useEffect, useState } from 'react'
import styled from '@emotion/styled'
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

  function handleSubmit(e) {
    e.preventDefault()
    const { value: emailValue } = email
    const { value: passwordValue } = password
    console.log({ emailValue, passwordValue })
    try {
      firebase
        .auth()
        .signInWithEmailAndPassword(emailValue, passwordValue)
        .catch(e => {
          setError(e.message)
        })
    } catch (e) {
      console.log('unexpected error:', e)
      email.reset()
      password.reset()
      setError(e.message)
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
        background: '#fff',
        padding: '2em',
        fontSize: '18px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h4>Sign in</h4>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
      <form onSubmit={handleSubmit}>
        <div
          style={{
            margin: '2em 0',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <label style={{ marginRight: '2em' }}>Email</label>
          <input
            {...email.input({
              type: 'email',
              required: true,
              style: { fontSize: '18px' },
              onFocus: resetError,
            })}
          />
        </div>
        <div
          style={{
            margin: '2em 0',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <label style={{ marginRight: '2em' }}>Password</label>
          <input
            {...password.input({
              type: 'password',
              required: true,
              style: { fontSize: '18px' },
              onFocus: resetError,
            })}
          />
        </div>
        <div
          style={{
            margin: '2em 0',
          }}
        >
          <button>Submit</button>
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
