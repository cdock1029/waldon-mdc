import React, { useContext } from 'react'
import {
  TopAppBar,
  TopAppBarFixedAdjust,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarNavigationIcon,
  TopAppBarActionItem,
  TopAppBarTitle,
} from 'rmwc'
import { css } from 'react-emotion/macro'
import { navigate } from '@reach/router'
import { AuthContext } from '../firebase/Auth'

export function AppBar({ onMenuClick }) {
  const auth = useContext(AuthContext)
  function signOut() {
    auth.signOut()
  }
  return (
    <>
      <TopAppBar className={styles}>
        <TopAppBarRow>
          {auth.user ? (
            <React.Fragment>
              <TopAppBarSection alignStart>
                <TopAppBarNavigationIcon onClick={onMenuClick} icon="menu" />
                <TopAppBarTitle onClick={() => navigate('/')}>
                  WPM
                </TopAppBarTitle>
              </TopAppBarSection>
              <TopAppBarSection alignEnd>
                <React.Fragment>
                  <TopAppBarTitle>{auth.user.email}</TopAppBarTitle>
                  <TopAppBarActionItem
                    onClick={signOut}
                    aria-label="Sign out"
                    alt="Sign out"
                    icon="exit_to_app"
                  />
                </React.Fragment>
              </TopAppBarSection>
            </React.Fragment>
          ) : null}
        </TopAppBarRow>
      </TopAppBar>
      <TopAppBarFixedAdjust />
    </>
  )
}

const styles = css`
  background-color: #282c34;
  position: absolute;
  z-index: 7;

  .mdc-top-app-bar__title {
    cursor: pointer;
  }
`
