import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import { collectionData, docData } from 'rxfire/firestore'
import LRU from 'lru-cache'

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

export default firebase
