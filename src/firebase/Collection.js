import React, { useState, useEffect, useContext } from 'react'
import { AuthContext } from './Auth'
import { authCollection, createFirestoreCollectionResource } from './index'

export function useCollection({ path, options }) {
  const [data, setData] = useState()
  const { claims } = useContext(AuthContext)
  useEffect(
    () => {
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
export const PropertiesResource = createFirestoreCollectionResource(
  ({ claims: { activeCompany } }) => ({
    rootPath: `companies/${activeCompany}/properties`,
    orderBy: ['name', 'asc'],
  })
)

export const TenantsResource = createFirestoreCollectionResource(
  authContext => {
    const {
      claims: { activeCompany },
    } = authContext
    return {
      rootPath: `companies/${activeCompany}/tenants`,
      orderBy: ['lastName', 'asc'],
    }
  }
)

export const TodosResource = createFirestoreCollectionResource(() => ({
  rootPath: 'todos',
  orderBy: ['createdAt'],
}))
