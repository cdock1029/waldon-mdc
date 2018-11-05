import React, { createContext, useState, useEffect, useContext } from 'react'
import { user as rxUser } from 'rxfire/auth'
import firebase from './index'

function useAuth() {
  const [auth, setAuth] = useState()
  useEffect(() => {
    const sub = rxUser(firebase.auth()).subscribe(async user => {
      setAuth({
        user,
        claims: user ? (await user.getIdTokenResult()).claims : undefined,
      })
    })
    return () => {
      sub.unsubscribe()
    }
  }, [])
  return {
    ...auth,
    signOut() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          console.log('reloading')
          window.location.reload()
        })
    },
  }
}

export function useActiveCompany() {
  const { activeCompany } = useContext(AuthContext).claims
  return activeCompany
}

export const AuthContext = createContext()
export function AuthProvider({ children }) {
  const auth = useAuth()
  return <AuthContext.Provider value={auth} children={children} />
}
