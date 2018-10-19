import * as React from 'react'
import { cx } from 'react-emotion'
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
            className={cx('submenu__icon', {
              'submenu__icon--open': isOpen,
            })}
          />
        </ListItem>
        <div
          className={cx('submenu__children', {
            'submenu__children--open': isOpen,
          })}
        >
          {children}
        </div>
      </div>
    )
  }
}
