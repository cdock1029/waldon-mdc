import React from 'react'
import { Location as ReachLocation } from '@reach/router'
import qs from 'query-string'

export const Location = ({ children }) => (
  <ReachLocation>
    {props => {
      const { search } = props.location
      const q = search ? qs.parse(search) : {}
      return children({ ...props, q })
    }}
  </ReachLocation>
)
