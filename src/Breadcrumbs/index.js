import React from 'react'
import { Doc } from '../firebase/Doc'

export const Breadcrumbs = ({ p, u, children }) => (
  <div style={{ display: 'flex' }}>
    {u ? (
      <Doc path={`properties/${p}/units/${u}`}>
        {({ data }) => (
          <span>
            &nbsp;
            {'/'}
            &nbsp;
            {data.label}
          </span>
        )}
      </Doc>
    ) : p ? (
      <Doc path={`properties/${p}`}>
        {({ data }) => <span>{data.name}</span>}
      </Doc>
    ) : null}
    {children}
  </div>
)
