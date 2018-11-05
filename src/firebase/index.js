import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import { collectionData, docData } from 'rxfire/firestore'
import { unstable_createResource as createResource } from 'react-cache'
import { useEffect, useState, useRef } from 'react'

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
  return obs
}

function listsEqual(a, b, comparator) {
  if (a.length === 0 && b.length === 0) {
    return true
  }
  return (
    a.length === b.length &&
    comparator(a[0], b[0]) &&
    listsEqual(a.slice(1), b.slice(1), comparator)
  )
}

export function createFirestoreCollectionResource(
  buildParamsCallback,
  defaultComparator = (a, b) => false
) {
  function fetcher(input) {
    const firestoreQueryParams = buildParamsCallback(input)
    const firestoreObservable = getFirestoreObservable(firestoreQueryParams)

    let resolveCallback
    const initialValue = new Promise(resolve => {
      resolveCallback = resolve
    })

    let valueContainer = {
      currentValue: undefined,
      observable: firestoreObservable,
      subscription: firestoreObservable.subscribe(data => {
        valueContainer.currentValue = data
        if (resolveCallback) {
          resolveCallback(valueContainer)
          resolveCallback = null
        }
      }),
    }

    return initialValue
  }

  const Resource = createResource(
    fetcher,
    input =>
      JSON.stringify(
        input
      ) /* handle special types like Resource, Timestamp etc */
  )

  return {
    read(input, areObjectsEqual) {
      const valueContainer = Resource.read(input)

      const [currValueContainer, setCurrValueContainer] = useState(
        valueContainer
      )

      if (currValueContainer !== valueContainer) {
        setCurrValueContainer(valueContainer)
      }
      useEffect(
        () => {
          const sub = valueContainer.observable.subscribe(newData => {
            currValueContainer.currentValue = newData
            setCurrValueContainer(currValueContainer)
          })
          return () => {
            sub.unsubscribe()
          }
        },
        [JSON.stringify(input)]
      )

      return currValueContainer.currentValue
    },
  }
}

// function areEqual(a, b, comparator) {
//   if (Array.isArray(a) && Array.isArray(b)) {
//     console.log('is array')
//     return listsEqual(a, b, comparator)
//   }
//   console.log('not array', { a: a.id, b: b.id })
//   return comparator(a, b)
// }

export default firebase
