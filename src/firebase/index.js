import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import './observableConfig'
import { user } from 'rxfire/auth'
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

function getRef(path) {
  let fixedPath
  if (path.charAt(0) === '/') {
    fixedPath = path
  } else {
    fixedPath = `companies/${getClaim('activeCompany')}/${path}`
  }
  return [firebase.firestore().collection(fixedPath), fixedPath]
}

export function authCollection(path, options) {
  let [ref, fixedPath] = getRef(path)
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
  const serialStr = JSON.stringify({ fixedPath, options })
  saveRef(serialStr, ref)
  return collectionData(ref, 'id')
}

const cache = LRU({
  max: 30,
  dispose: (key, unsub) => {
    // console.log('purging:', key)
    unsub()
  },
})
function noOp() {}
function saveRef(str, ref) {
  if (!cache.has(str)) {
    // console.log('adding', str)
    const unsub = ref.onSnapshot({ next: noOp, error: () => unsub() })
    cache.set(str, unsub)
  } else {
    // console.log('cache hit!', str)
  }
}
export function authDoc(path) {
  let checkPath
  if (path.charAt(0) === '/') {
    checkPath = path
  } else {
    checkPath = `companies/${getClaim('activeCompany')}/${path}`
  }
  const ref = firebase.firestore().doc(checkPath)
  const serialStr = JSON.stringify({ checkPath })
  saveRef(serialStr, ref)
  return docData(ref, 'id')
}

let claimsData
export function observeUser(
  callback, //: (u, c) => void,
  claimsKeys //: string[],
) {
  return user(firebase.auth()).subscribe(async u => {
    const tempClaims = {}
    if (u) {
      const token = await u.getIdTokenResult()
      claimsData = claimsKeys.reduce((acc, claim) => {
        acc[claim] = token.claims[claim]
        return acc
      }, tempClaims)
    }
    claimsData = tempClaims
    callback(u, claimsData)
  })
}
export const getClaim = key => claimsData[key]

const serverTimestamp = () => firebase.firestore.FieldValue.serverTimestamp()

export function createDoc(path, data) {
  const [ref] = getRef(path)
  return ref.doc().set({
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...data,
  })
}

export default firebase
