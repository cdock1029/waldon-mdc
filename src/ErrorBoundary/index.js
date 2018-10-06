import React from 'react'
import { css } from 'react-emotion'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: '', info: '' }
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true, error, info })
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, info);
  }

  render() {
    const { hasError, error, info } = this.state
    if (hasError) {
      return (
        <div className={styles}>
          <pre>{error.message}</pre>
          <br />
          <div>{JSON.stringify(info, null, 2)}</div>
        </div>
      )
    }
    return this.props.children
  }
}

const styles = css`
  color: darkred;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`
