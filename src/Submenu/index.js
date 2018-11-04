import React, { useState, useEffect } from 'react'
import styled from 'styled-components/macro'
import { ListItem, ListItemMeta, ListItemText } from '@material/react-list'
import MaterialIcon from '@material/react-material-icon'

export function Submenu({ text, children, onClick, activated = false }) {
  const [isOpen, setIsOpen] = useState(false)
  useEffect(
    () => {
      if (activated) {
        requestAnimationFrame(() => {
          if (!isOpen) {
            setIsOpen(true)
          }
        })
      } else if (isOpen) {
        requestAnimationFrame(() => {
          setIsOpen(false)
        })
      }
    },
    [activated]
  )
  function toggleForWhenAlreadyActivated() {
    setIsOpen(!isOpen)
  }
  return (
    <SubmenuWrapper>
      <ListItem
        className={`submenu-list-item${activated ? activatedClass : ''}`}
        onClick={() => {
          onClick()
          toggleForWhenAlreadyActivated()
        }}
      >
        <ListItemText primaryText={text} />
        <ListItemMeta
          meta={<MaterialIcon icon="chevron_right" />}
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
    </SubmenuWrapper>
  )
}

const activatedClass = ' mdc-list-item--activated'

const cb = 'cubic-bezier(0.4, 0, 0.2, 1)'
const SubmenuWrapper = styled.div`
  float: left;
  width: 100%;
  .submenu-list-item {
    cursor: pointer;
  }

  .submenu__children {
    overflow: hidden;
    height: 0;
    transition: height 250ms ${cb};
  }

  .submenu__children--open {
    height: 16rem;
    overflow-y: scroll;
    transition: height 250ms ${cb};
  }

  .submenu__icon {
    transition: transform 200ms 50ms ${cb};
    user-select: none;
  }

  .submenu__icon--open {
    transform: rotate(90deg);
  }

  .submenu__children .mdc-list-item > span:before {
    content: '';
    display: inline-block;
    width: 1.5rem;
  }
`
