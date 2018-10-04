import React from 'react'
import { Location as L } from '@reach/router'
import qs from 'query-string'

export const Location = ({ children }) => (
  <L>
    {props => {
      let q
      if (props.location.search) {
        q = qs.parse(props.location.search)
      }
      return children({ ...props, q })
    }}
  </L>
)
