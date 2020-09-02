import firebase from 'firebase/app';
import 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDwJACmFZSkjQfM5wwdCsjx3KvZosoQPxA",
    authDomain: "obracun-place.firebaseapp.com",
    databaseURL: "https://obracun-place.firebaseio.com",
    projectId: "obracun-place",
    storageBucket: "obracun-place.appspot.com",
    messagingSenderId: "357075200818",
    appId: "1:357075200818:web:755951a9e4c14a89fa852b",
    measurementId: "G-9Y8FY5LEX9"
  };

firebase.initializeApp(firebaseConfig);

const storage = firebase.storage();

export { storage, firebase as default };