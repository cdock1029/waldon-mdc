import React from 'react'
import { css } from 'react-emotion'

export class Dashboard extends React.Component {
  render() {
    const { children } = this.props
    return (
      <div className={styles}>
        {children}
        <div className="Dashboard-Data">
          <h5>TODO: table data in dashboard</h5>
        </div>
      </div>
    )
  }
}

const styles = css`
  display: flex;
  flex-direction: column;
  .Dashboard-Data {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
`
