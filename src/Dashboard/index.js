import React from 'react'
import { NewSubUnit } from '../NewSubUnit'
import './styles.scss'

export class Dashboard extends React.Component {
  render() {
    const { children } = this.props
    return (
      <div className="Dashboard">
        <h5>Dashboard</h5>
        <NewSubUnit />
        {children}
      </div>
    )
  }
}
