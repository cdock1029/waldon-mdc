import React, { Fragment } from 'react'
import {
  TopAppBar,
  TopAppBarFixedAdjust,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarNavigationIcon,
  TopAppBarActionItem,
  TopAppBarTitle,
} from 'rmwc'
import { navigate } from '@reach/router'
import './styles.scss'
import firebase from '../firebase'

export class AppBar extends React.Component {
  signOut = () => {
    firebase.auth().signOut()
  }
  render() {
    const user = firebase.auth().currentUser
    const { onMenuClick } = this.props
    return (
      <Fragment>
        <TopAppBar className="AppBar-TopAppBar">
          <TopAppBarRow>
            {user ? (
              <React.Fragment>
                <TopAppBarSection alignStart>
                  <TopAppBarNavigationIcon onClick={onMenuClick} icon="menu" />
                  <TopAppBarTitle onClick={() => navigate('/')}>
                    WPM
                  </TopAppBarTitle>
                </TopAppBarSection>
                <TopAppBarSection alignEnd>
                  <React.Fragment>
                    <TopAppBarTitle>{user.email}</TopAppBarTitle>
                    <TopAppBarActionItem
                      onClick={this.signOut}
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
      </Fragment>
    )
  }
}
