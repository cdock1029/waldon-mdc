import { useState, useEffect, useContext } from 'react'
import { docData } from 'rxfire/firestore'
import firebase from './index'
import { AuthContext } from './Auth'

function authDoc({ path, activeCompany }) {
  let fixedPath
  if (path.charAt(0) === '/') {
    fixedPath = path
  } else {
    fixedPath = `companies/${activeCompany}/${path}`
  }
  let ref = firebase.firestore().doc(fixedPath)
  // const serialStr = JSON.stringify({ fixedPath })
  // saveRef(serialStr, ref)
  return docData(ref, 'id')
}

export function useDoc({ path }) {
  const [data, setData] = useState(null)
  const { claims } = useContext(AuthContext)
  useEffect(
    () => {
      if (claims) {
        const sub = authDoc({
          path,
          activeCompany: claims.activeCompany,
        }).subscribe(setData)
        return () => {
          sub.unsubscribe()
        }
      }
    },
    [path, claims]
  )
  return data
}
