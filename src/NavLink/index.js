import React from 'react'
import { Link } from '@reach/router'

const isPartiallyActive = ({ isPartiallyCurrent }) => {
  return isPartiallyCurrent ? { className: 'active' } : null
}

export const NavLink = props => <Link getProps={isPartiallyActive} {...props} />
