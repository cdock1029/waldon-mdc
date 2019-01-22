import React, { createContext, useState, useEffect, useContext } from 'react'
import { user as rxUser } from 'rxfire/auth'
import { doc } from 'rxfire/firestore'
import { switchMap, map } from 'rxjs/operators'
import { of, combineLatest } from 'rxjs'
import firebase from './index'

function useAuth() {
  const userProfilesRef = firebase.firestore().collection('userProfiles')
  const [auth, setAuth] = useState()
  useEffect(() => {
    const userAndProfile$ = rxUser(firebase.auth()).pipe(user$ => {
      return combineLatest(
        user$,
        user$.pipe(
          switchMap(user =>
            user
              ? doc(userProfilesRef.doc(user.uid)).pipe(
                  map(snap => snap.data())
                )
              : of({})
          )
        )
      )
    })
    const sub = userAndProfile$.subscribe(async ([user, userProfile]) => {
      const claims = user ? (await user.getIdTokenResult(true)).claims : {}
      setAuth({
        user,
        userProfile,
        claims,
      })
    })
    return () => {
      sub.unsubscribe()
    }
  }, [])
  // console.log({ ...auth })
  return {
    ...auth,
    signOut() {
      firebase.auth().signOut()
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
