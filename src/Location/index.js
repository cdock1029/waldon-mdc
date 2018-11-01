import React, { createContext, useMemo } from 'react'
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
