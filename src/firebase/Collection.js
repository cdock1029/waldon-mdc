import React, { useState, useEffect, useContext } from 'react'
import { collectionData } from 'rxfire/firestore'
import firebase from './index'
import { AuthContext } from './Auth'

function authCollection({ path, options, activeCompany }) {
  let fixedPath
  if (path.charAt(0) === '/') {
    fixedPath = path
  } else {
    fixedPath = `companies/${activeCompany}/${path}`
  }
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
  // const serialStr = serialize({ fixedPath, ...options })
  // console.log({ serialStr, ...options })
  // saveRef(serialStr, ref)
  return collectionData(ref, 'id')
}

export function useCollection({ path, options }) {
  const [data, setData] = useState()
  const { claims } = useContext(AuthContext)
  useEffect(
    () => {
      console.log('running effect')
      if (claims) {
        const sub = authCollection({
          path,
          options,
          activeCompany: claims.activeCompany,
        }).subscribe(setData)
        return () => {
          sub.unsubscribe()
        }
      }
    },
    [path, JSON.stringify(options), claims]
  )
  return data
}

export const PropertiesContext = React.createContext()
export const PropertiesProvider = ({ children }) => {
  const data = useCollection({
    path: 'properties',
    options: { orderBy: ['name'] },
  })
  return <PropertiesContext.Provider value={data} children={children} />
}

export const TenantsContext = React.createContext()
export const TenantsProvider = ({ children }) => {
  const data = useCollection({ path: 'tenants' })
  return <TenantsContext.Provider value={data} children={children} />
}
