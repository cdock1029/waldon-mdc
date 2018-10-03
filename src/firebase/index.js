import firebase from 'firebase/app'
import 'firebase/auth'

const config = {
  apiKey: 'AIzaSyDlWm0Ftq30kFD4LnPJ5sf9Mz8vyrcjIfM',
  authDomain: 'wpmfirebaseproject.firebaseapp.com',
  databaseURL: 'https://wpmfirebaseproject.firebaseio.com',
  projectId: 'wpmfirebaseproject',
  storageBucket: 'wpmfirebaseproject.appspot.com',
  messagingSenderId: '1038799458160',
}
firebase.initializeApp(config)

export default firebase
