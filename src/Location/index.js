import React, { createContext, useState, useEffect } from 'react'
import { LocationProvider } from '@reach/router'
import qs from 'query-string'

export const QueryContext = createContext()
export function QueryProvider({ children }) {
  return (
    <LocationProvider>
      {ctx => {
        console.log({ ...ctx })
        return <QueryComponent {...ctx}>{children}</QueryComponent>
      }}
    </LocationProvider>
  )
}

function QueryComponent({ location: { search }, children }) {
  const [q, setQ] = useState(qs.parse(search))
  useEffect(
    () => {
      setQ(qs.parse(search))
    },
    [search]
  )

  return <QueryContext.Provider value={q}>{children}</QueryContext.Provider>
}
