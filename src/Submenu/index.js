import React, { memo, useState, useEffect, forwardRef } from 'react'
import styled from 'styled-components/macro'
import { ListItem, ListItemMeta, ListItemText } from '@material/react-list'
import MaterialIcon from '@material/react-material-icon'

function areEqual(prevProps, nextProps) {
  return (
    prevProps.text === nextProps.text &&
    prevProps.activated === nextProps.activated &&
    prevProps.selected === nextProps.selected
  )
}

export const Submenu = memo(
  forwardRef(
    ({ text, children, handleItemClick, activated, selected }, ref) => {
      const [isOpen, setIsOpen] = useState(selected)

      // todo: do this immediately somehow..
      useEffect(
        () => {
          if (isOpen && !activated) {
            setIsOpen(false)
          }
        },
        [activated]
      )

      return (
        <SubmenuWrapper>
          <ListItem
            ref={ref}
            title={text}
            className={
              activated ? activatedClass : selected ? selectedClass : undefined
            }
            onClick={() => {
              setIsOpen(open => !open)
              requestAnimationFrame(() => {
                handleItemClick()
              })
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
  ),
  areEqual
)

const activatedClass = 'mdc-list-item--activated'
const selectedClass = 'mdc-list-item--selected'

const cb = 'cubic-bezier(0.4, 0, 0.2, 1)'
const SubmenuWrapper = styled.div`
  float: left;
  width: 100%;

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
    transition: transform 350ms ${cb};
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
