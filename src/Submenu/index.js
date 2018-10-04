import * as React from 'react'
import { cx } from 'react-emotion'
import { ListItem, ListItemMeta } from 'rmwc'

export class Submenu extends React.Component {
  state = {
    isOpen: false,
  }

  render() {
    const { children, label } = this.props
    return (
      <div className="submenu">
        <ListItem onClick={() => this.setState({ isOpen: !this.state.isOpen })}>
          <span>{label}</span>
          <ListItemMeta
            icon="chevron_right"
            className={cx('submenu__icon', {
              'submenu__icon--open': this.state.isOpen,
            })}
          />
        </ListItem>
        <div
          className={cx('submenu__children', {
            'submenu__children--open': this.state.isOpen,
          })}
        >
          {children}
        </div>
      </div>
    )
  }
}
