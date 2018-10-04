import * as React from 'react'
import { cx } from 'react-emotion'
import { ListItem, ListItemMeta } from 'rmwc'
import './styles.scss'

export class Submenu extends React.Component {
  state = {
    isOpen: true,
  }

  handleListItemClick = () => {
    console.log('Submenu clicked')
    this.setState({ isOpen: !this.state.isOpen })
  }
  render() {
    const { children, label } = this.props
    return (
      <div className="submenu">
        <ListItem
          className="submenu-list-item"
          activated={true}
          onClick={this.handleListItemClick}
        >
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
