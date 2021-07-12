import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/storage';
import 'firebase/database';

var firebaseConfig = {
    apiKey: "AIzaSyDm3P9134lOT85QloQ3z62fwvm-Ky40WC4",
    authDomain: "demoproject-63717.firebaseapp.com",
    projectId: "demoproject-63717",
    storageBucket: "demoproject-63717.appspot.com",
    messagingSenderId: "60046397751",
    appId: "1:60046397751:web:9aa62545ced606b693cab2",
    measurementId: "G-4PTMK0ZZ1W"
};
  // Initialize Firebase
const fire = firebase.initializeApp(firebaseConfig);
// firebase.analytics();

export default fire;