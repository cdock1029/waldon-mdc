import { useState, useEffect, useContext } from 'react'
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

export const PropertiesResource = createFirestoreCollectionResource(
  ({ activeCompany }) => ({
    rootPath: `companies/${activeCompany}/properties`,
    orderBy: ['name', 'asc'],
  })
)

export const TenantsResource = createFirestoreCollectionResource(
  ({ activeCompany }) => {
    return {
      rootPath: `companies/${activeCompany}/tenants`,
      orderBy: ['lastName', 'asc'],
    }
  }
)

// todo: doesn't work for dynamic parameters yet...
export const UnitsResource = createFirestoreCollectionResource(
  ({ activeCompany, propertyId }) => {
    console.log({ propertyId })
    return {
      rootPath: `companies/${activeCompany}/properties/${propertyId}/units`,
    }
  }
)

export const TodosResource = createFirestoreCollectionResource(() => ({
  rootPath: 'todos',
  orderBy: ['createdAt'],
}))
