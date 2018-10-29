import React from 'react'
import { useDoc } from '../firebase/Doc'

export const Breadcrumbs = ({ p, u, children }) => {
  let path = u ? `properties/${p}/units/${u}` : p ? `properties/${p}` : null
  const data = path ? useDoc({ path }) : null
  return !data ? null : (
    <div style={{ display: 'flex' }}>
      {u ? (
        <span>
          &nbsp;
          {'/'}
          &nbsp;
          {data.label}
        </span>
      ) : p ? (
        <span>{data.name}</span>
      ) : null}
      {children}
    </div>
  )
}
