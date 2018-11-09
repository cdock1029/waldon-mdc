import React from 'react'

export function Loading({ children }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '5rem',
      }}
    >
      {children}
    </div>
  )
}
