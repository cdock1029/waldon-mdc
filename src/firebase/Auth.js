import React, { createContext, useState, useEffect } from 'react'
import { user as rxUser } from 'rxfire/auth'
import { docData } from 'rxfire/firestore'
import LRU from 'lru-cache'
import firebase from './index'

function noOp() {}
const serverTimestamp = () => firebase.firestore.FieldValue.serverTimestamp()
const cache = LRU({
  max: 30,
  dispose: (key, unsub) => {
    console.log('purging:', key)
    unsub()
  },
})
function saveRef(str, ref) {
  if (!cache.has(str)) {
    console.log('adding to cache', str)
    const unsub = ref.onSnapshot({ next: noOp, error: () => unsub() })
    cache.set(str, unsub)
  } else {
    console.log('cache hit!', str)
  }
}
function serialize({ fixedPath, where, orderBy }) {
  if (where) {
    for (let item of where) {
      if (item[2] instanceof firebase.firestore.DocumentReference) {
        item[2] = item[2].path
      }
    }
  }
  return JSON.stringify({
    fixedPath,
    where,
    orderBy,
  })
}

function getCollectionRef(path) {
  const fixedPath = fixPath({ path })
  return [firebase.firestore().collection(fixedPath), fixedPath]
}
function getDocRef(path) {
  const fixedPath = fixPath({ path })
  return [firebase.firestore().doc(fixedPath), fixedPath]
}
function saveDoc({ collectionPath, data, docId }) {
  /* docId: if updating an existing doc */
  let [ref] = getCollectionRef(collectionPath)
  const docData = {
    updatedAt: serverTimestamp(),
    ...(docId ? {} : { createdAt: serverTimestamp() }),
    ...data,
  }
  ref = docId ? ref.doc(docId) : ref.doc()
  return ref.set(docData)
}
function deleteDoc({ collectionPath, docId }) {
  const [ref] = getCollectionRef(collectionPath)
  return ref.doc(docId).delete()
  // console.log({ ref: ref.doc(docId) })
}
function authDoc(path) {
  const [ref, fixedPath] = getDocRef(path)
  const serialStr = JSON.stringify({ fixedPath })
  saveRef(serialStr, ref)
  return docData(ref, 'id')
}

function fixPath({ path, activeCompany }) {
  let fixedPath
  if (path.charAt(0) === '/') {
    fixedPath = path
  } else {
    fixedPath = `companies/${activeCompany}/${path}`
  }
  return fixedPath
}

function useAuth() {
  const [user, setUser] = useState()
  const [claims, setClaims] = useState()
  useEffect(() => {
    const sub = rxUser(firebase.auth()).subscribe(async u => {
      if (u) {
        const token = await u.getIdTokenResult()
        setUser(u)
        setClaims(token.claims)
      } else {
        setUser(u)
        setClaims()
      }
    })
    return () => {
      sub.unsubscribe()
    }
  }, [])
  return {
    user,
    claims,
    signOut() {
      firebase.auth().signOut()
    },
  }
}

// let claimsData
export const AuthContext = createContext()
export function AuthProvider({ children }) {
  const auth = useAuth()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}
