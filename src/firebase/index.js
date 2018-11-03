import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import { collectionData, docData } from 'rxfire/firestore'
import LRU from 'lru-cache'
import { unstable_createResource as createResource } from 'react-cache'
import { useEffect, useState } from 'react'

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

const cache = LRU({
  max: 30,
  dispose: (key, unsub) => {
    // console.log('purging:', key)
    unsub()
  },
})
function noOp() {}
export function saveRef(str, ref) {
  if (!cache.has(str)) {
    // console.log('adding', str)
    const unsub = ref.onSnapshot({ next: noOp, error: () => unsub() })
    cache.set(str, unsub)
  } else {
    // console.log('cache hit!', str)
  }
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

export function authCollection({ path, options, activeCompany }) {
  const fixedPath = fixPath({ path, activeCompany })
  let ref = firebase.firestore().collection(fixedPath)

  if (options) {
    const { where, orderBy } = options
    if (where) {
      for (const clause of where) {
        ref = ref.where(...clause)
      }
    }
    if (orderBy) {
      ref = ref.orderBy(...orderBy)
    }
  }
  const serialStr = serialize({ fixedPath, ...options })
  saveRef(serialStr, ref)
  return collectionData(ref, 'id')
}
export function authDoc({ path, activeCompany }) {
  const fixedPath = fixPath({ path, activeCompany })
  let ref = firebase.firestore().doc(fixedPath)
  const serialStr = JSON.stringify({ fixedPath })
  saveRef(serialStr, ref)
  return docData(ref, 'id')
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

// const cache = new Map()
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
  const obs = collectionData(ref, 'id')
  // cache.set()
  return obs
}

function resourceHashFunction(input) {
  return JSON.stringify(input)
}
export function createFirestoreCollectionResource(callback) {
  function thenableFunctionPassedToReactCreateResource(input) {
    // console.log({ input })
    const firestoreQueryParams = callback(input)
    const firestoreObservable = getFirestoreObservable(firestoreQueryParams)

    let resolveCallback
    let startingPromise = new Promise(resolve => {
      resolveCallback = resolve
    })

    const valueContainer = {
      observable: firestoreObservable,
      // currentValue
    }

    firestoreObservable.subscribe(data => {
      console.log('subscribe callback')
      valueContainer.currentValue = data

      //if (!hasPromisedResolved) {
      // hasPromisedResolved = true
      if (resolveCallback) {
        console.log('resolving promise..')
        resolveCallback(valueContainer)
        resolveCallback = null
      }
      //} else {
      // console.log('not resolving promise:', { input })
      // }
    })
    return startingPromise
  }

  const Resource = createResource(
    thenableFunctionPassedToReactCreateResource,
    resourceHashFunction
  )

  return {
    read(input) {
      console.log('Lease resource read:', JSON.stringify({ input }))
      const valueContainer = Resource.read(input)
      const [value, setValue] = useState(valueContainer.currentValue)
      // setValue(valueContainer.currentValue)
      console.log(
        'Lease resource read:',
        JSON.stringify({
          currentValue: valueContainer.currentValue,
          hookStateValue: value,
        })
      )
      useEffect(
        () => {
          const sub = valueContainer.observable.subscribe(data => {
            setValue(data)
          })
          return () => {
            console.log('unsubbing')
            sub.unsubscribe()
          }
        },
        [JSON.stringify(input)]
      )
      return value
    },
  }
}

export default firebase
