import React from 'react'
import { Location as L } from '@reach/router'
import qs from 'query-string'

export const Location = ({ children }) => (
  <L>
    {props => {
      const { search } = props.location
      const q = search ? qs.parse(search) : {}
      return children({ ...props, q })
    }}
  </L>
)
