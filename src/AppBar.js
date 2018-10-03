import React from 'react'
import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarNavigationIcon,
  TopAppBarActionItem,
  TopAppBarTitle,
} from 'rmwc'
import firebase from './firebase'

export class AppBar extends React.Component {
  signOut = () => {
    firebase.auth().signOut()
  }
  render() {
    const user = firebase.auth().currentUser
    return (
      <TopAppBar>
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            <TopAppBarNavigationIcon icon="menu" />
            <TopAppBarTitle>Title</TopAppBarTitle>
          </TopAppBarSection>
          <TopAppBarSection alignEnd>
            {/* <TopAppBarActionItem
              aria-label="Download"
              alt="Download"
              icon="file_download"
            />
            <TopAppBarActionItem
              aria-label="Print this page"
              alt="Print this page"
              icon="print"
            /> */}
            {user && (
              <TopAppBarActionItem
                onClick={this.signOut}
                aria-label="Sign out"
                alt="Sign out"
                icon="exit_to_app"
              />
            )}
          </TopAppBarSection>
        </TopAppBarRow>
      </TopAppBar>
    )
  }
}
