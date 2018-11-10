import React, { useContext } from 'react'
import TopAppBar from '@material/react-top-app-bar'
import MaterialIcon from '@material/react-material-icon'
import styled from 'styled-components/macro'
import { navigate } from '@reach/router'
import { AuthContext } from '../firebase/Auth'

export function AppBar({ onMenuClick }) {
  const auth = useContext(AuthContext)
  function signOut() {
    auth.signOut()
  }
  function navigateHome() {
    navigate('/')
  }
  function navigateFirestore() {
    navigate('/firestore')
  }
  return (
    <StyledTopAppBar
      title={<span onClick={navigateHome}>WPM</span>}
      navigationIcon={<MaterialIcon icon="menu" onClick={onMenuClick} />}
      actionItems={[
        <MaterialIcon icon="bookmark" onClick={navigateFirestore} />,
        <MaterialIcon
          aria-label="Sign out"
          alt="Sign out"
          icon="exit_to_app"
          onClick={signOut}
        />,
      ]}
    />
  )
}

const StyledTopAppBar = styled(TopAppBar)`
  background-color: #282c34;
  position: absolute;
  z-index: 7;

  .mdc-top-app-bar__title {
    cursor: pointer;
  }
`
