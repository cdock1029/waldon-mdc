import * as React from 'react'
import { ListItem, ListItemMeta } from 'rmwc'
import './styles.scss'

export class Submenu extends React.Component {
  static defaultProps = {
    activated: false,
  }
  state = {
    isOpen: false,
  }
  componentDidMount() {
    if (this.props.activated) {
      setTimeout(() => {
        this.setState(() => ({ isOpen: true }))
      }, 0)
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.props.activated !== prevProps.activated) {
      this.setState(() => ({ isOpen: this.props.activated }))
    }
  }
  handleListItemClick = () => {
    this.setState(({ isOpen }) => ({ isOpen: !isOpen }))
  }
  render() {
    const { children, label, activated, ...rest } = this.props
    const { isOpen } = this.state
    return (
      <div className="submenu">
        <ListItem
          className="submenu-list-item"
          activated={activated}
          onClick={this.handleListItemClick}
          {...rest}
        >
          <span>{label}</span>
          <ListItemMeta
            icon="chevron_right"
            className={`submenu__icon${isOpen ? ' submenu__icon--open' : ''}`}
          />
        </ListItem>
        <div
          className={`submenu__children${
            isOpen ? ' submenu__children--open' : ''
          }`}
        >
          {children}
        </div>
      </div>
    )
  }
}
