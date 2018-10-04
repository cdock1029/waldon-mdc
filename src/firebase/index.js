import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import './observableConfig'
import { user } from 'rxfire/auth'
import { collectionData } from 'rxfire/firestore'
// import {} from 'rxjs/oper'

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
  // const serialStr = JSON.stringify({ fixedPath, options })
  // saveRef(serialStr, ref)
  return collectionData(ref, 'id')
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

export default firebase
