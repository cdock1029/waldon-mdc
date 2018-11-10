import React, { createContext, useMemo, useContext } from 'react'
import { LocationProvider } from '@reach/router'
import qs from 'query-string'

export const QueryContext = createContext()
export function QueryProvider({ children }) {
  return (
    <LocationProvider>
      {ctx => {
        return <QueryComponent {...ctx}>{children}</QueryComponent>
      }}
    </LocationProvider>
  )
}

function QueryComponent({ location: { search }, children }) {
  const q = useMemo(
    () => {
      return qs.parse(search)
    },
    [search]
  )

  return <QueryContext.Provider value={q}>{children}</QueryContext.Provider>
}

export function useQueryParams(paramsArr) {
  const q = useContext(QueryContext)
  const params = useMemo(
    () => {
      let result = []
      for (let p of paramsArr) {
        result.push(q[p])
      }
      return result
    },
    [...paramsArr, q]
  )
  return params
}
