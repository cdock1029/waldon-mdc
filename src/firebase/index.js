import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import { collectionData, docData } from 'rxfire/firestore'
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

export function saveDoc({ rootPath, path, data }) {
  let ref = firebase.firestore().collection(rootPath)

  const docData = {
    updatedAt: serverTimestamp(),
    ...(path ? {} : { createdAt: serverTimestamp() }),
    ...data,
  }
  ref = path ? ref.doc(path) : ref.doc()
  return ref.set(docData)
}

export function deleteDoc({ path }) {
  let ref = firebase.firestore().doc(path)
  return ref.delete()
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

export function createFirestoreCollectionResource(buildParamsCallback) {
  function fetcher(input) {
    const firestoreQueryParams = buildParamsCallback(input)
    const firestoreObservable = getFirestoreObservable(firestoreQueryParams)

    let resolveCallback
    const initialValue = new Promise(resolve => {
      resolveCallback = resolve
    })

    const listenersSet = new Set()
    function subscribeToUpdates(callback) {
      listenersSet.add(callback)

      return () => {
        listenersSet.delete(callback)
      }
    }
    let valueContainer = {
      currentValue: undefined,
      observable: firestoreObservable,
      subscription: firestoreObservable.subscribe(data => {
        valueContainer.currentValue = data
        valueContainer.subscribeToUpdates = subscribeToUpdates
        if (resolveCallback) {
          resolveCallback(valueContainer)
          resolveCallback = null
        } else {
          // subsequent updates
          listenersSet.forEach(callback => {
            callback(valueContainer)
          })
        }
      }),
    }
    let authUnsub = firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        valueContainer.subscription.unsubscribe()
        authUnsub()
      }
    })

    return initialValue
  }

  const Resource = createResource(
    fetcher,
    input =>
      JSON.stringify(input) /* todo: customize for other types like Reference */
  )

  return {
    read(input) {
      const valueContainer = Resource.read(input)
      const [currValueContainer, setCurrValueContainer] = useState(
        valueContainer
      )

      if (currValueContainer !== valueContainer) {
        setCurrValueContainer(valueContainer)
      }

      useEffect(
        () => {
          const unsub = valueContainer.subscribeToUpdates(container => {
            setCurrValueContainer(container)
          })
          return unsub
        },
        [JSON.stringify(input)]
      )

      return currValueContainer.currentValue
    },
  }
}

export default firebase
