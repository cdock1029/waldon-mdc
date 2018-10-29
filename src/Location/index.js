import React, { createContext, useState, useEffect } from 'react'
import {
  Location as ReachLocation,
  LocationProvider,
  createHistory,
} from '@reach/router'
import qs from 'query-string'

function parseLocation(location) {
  const search = location.search
  return search ? qs.parse(search) : {}
}

export const Location = ({ children }) => (
  <ReachLocation>
    {props => {
      const q = parseLocation(props.location)
      return children({ ...props, q })
    }}
  </ReachLocation>
)

const history = createHistory(window)

export const QueryContext = createContext()
export function QueryProvider({ children }) {
  return (
    <LocationProvider history={history}>
      {context => {
        return <QueryComponent {...context}>{children}</QueryComponent>
      }}
    </LocationProvider>
  )
}

function QueryComponent({ location: { search }, children }) {
  const [q, setQ] = useState(qs.parse(search))
  useEffect(
    () => {
      console.log('updating Q')
      setQ(qs.parse(search))
    },
    [search]
  )

  return <QueryContext.Provider value={q}>{children}</QueryContext.Provider>
}
