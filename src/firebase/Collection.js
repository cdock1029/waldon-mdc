import React, { useState, useEffect, useContext } from 'react'
import { AuthContext } from './Auth'
import { authCollection } from './index'

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
// export const TenantsProvider = ({ children }) => {
//   const data = useCollection({ path: 'tenants' })
//   return <TenantsContext.Provider value={data} children={children} />
// }
