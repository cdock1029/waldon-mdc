import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import { collectionData, docData } from 'rxfire/firestore'
import LRU from 'lru-cache'
import { unstable_createResource as createResource } from 'react-cache'
import { useEffect, useState, useMemo } from 'react'

const config = {
  apiKey: 'AIzaSyDlWm0Ftq30kFD4LnPJ5sf9Mz8vyrcjIfM',
  authDomain: 'wpmfirebaseproject.firebaseapp.com',
  databaseURL: 'https://wpmfirebaseproject.firebaseio.com',
  projectId: 'wpmfirebaseproject',
  storageBucket: 'wpmfirebaseproject.appspot.com',
  messagingSenderId: '1038799458160',
}
firebase.initializeApp(config)
firebase.firestore().settings({ timestampsInSnapshots: true })

const serverTimestamp = () => firebase.firestore.FieldValue.serverTimestamp()

function fixPath({ path, activeCompany }) {
  let fixedPath
  if (path.charAt(0) === '/') {
    fixedPath = path
  } else {
    fixedPath = `companies/${activeCompany}/${path}`
  }
  return fixedPath
}
export function serialize({ fixedPath, where, orderBy }) {
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

export function saveDoc({ collectionPath, data, docId, activeCompany }) {
  const fixedPath = fixPath({ path: collectionPath, activeCompany })
  let ref = firebase.firestore().collection(fixedPath)

  const docData = {
    updatedAt: serverTimestamp(),
    ...(docId ? {} : { createdAt: serverTimestamp() }),
    ...data,
  }
  /* docId: if updating an existing doc */
  ref = docId ? ref.doc(docId) : ref.doc()
  return ref.set(docData)
}

export function deleteDoc({ collectionPath, docId, activeCompany }) {
  const fixedPath = fixPath({ path: collectionPath, activeCompany })
  let ref = firebase.firestore().collection(fixedPath)

  return ref.doc(docId).delete()
  // console.log({ ref: ref.doc(docId) })
}

function getFirestoreObservable({ rootPath, path, orderBy, where }) {
  // const key = JSON.stringify({ rootPath, path, orderBy })
  // if (cache.has(key)) {
  //   return cache.get(key)
  // }

  let ref = firebase.firestore()
  if (rootPath) {
    ref = ref.collection(rootPath)
  }
  if (path) {
    ref = ref.doc(path)
  }
  if (orderBy) {
    ref = ref.orderBy(...orderBy)
  }
  if (where) {
    for (const clause of where) {
      ref = ref.where(...clause)
    }
  }
  const obs = path ? docData(ref, 'id') : collectionData(ref, 'id')
  // cache.set()
  return obs
}

function paramsToKey(input) {
  return JSON.stringify(input)
}

const cache = LRU({
  max: 200,
  dispose: (key, container) => {
    console.log('purging:', key)
    container.subscription.unsubscribe()
  },
})
export function createFirestoreCollectionResource(callback) {
  function useFirestoreResource(input) {
    const [nothing, setNothing] = useState(0)
    const firestoreQueryParams = callback(input)
    const key = paramsToKey(firestoreQueryParams)
    console.log({ key })
    if (!cache.has(key)) {
      // console.log('miss')
      cache.set(key, {})
    }
    let valueContainer = cache.get(key)

    if (typeof valueContainer.currentValue === 'undefined') {
      const firestoreObservable = getFirestoreObservable(firestoreQueryParams)

      let resolveCallback
      valueContainer.currentValue = new Promise(resolve => {
        resolveCallback = resolve
      })

      valueContainer.subscription = firestoreObservable.subscribe(data => {
        // console.log('subscribe callback')
        valueContainer.currentValue = data

        if (resolveCallback) {
          // console.log('resolving promise..')
          resolveCallback(valueContainer)
          resolveCallback = null
        } else {
          // console.log('setting nothing...')
          console.log('new data')
          setNothing(1)
        }
      })
    }
    const stateValueContainer = useMemo(
      () => {
        console.log('memo rerun data')
        return valueContainer
      },
      [valueContainer.currentValue, key]
    )
    return [stateValueContainer.currentValue, nothing]
  }

  return {
    read(input) {
      const [value] = useFirestoreResource(input)
      if (value.then) {
        // console.log('throwing...')
        throw value
      }
      // console.log('returning', { value })
      return value
    },
  }
}

export default firebase
