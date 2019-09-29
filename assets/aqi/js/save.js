const prefix = "dms7827-";
const searchIDKey = prefix + "search";
const yearKey = prefix + "year";
const monthKey = prefix + "month"

const storedSearchID = localStorage.getItem(searchIDKey);
const storedYear = localStorage.getItem(yearKey);
const storedMonth = localStorage.getItem(monthKey);

function saveLocalStoredData(){
    localStorage.setItem(searchIDKey, app.selected.satId);
    localStorage.setItem(yearKey, app.selectedYear)
    localStorage.setItem(monthKey, app.selectedMonth)
}


  // Initialize Firebase
  const config = {
    apiKey: "AIzaSyDa9kMegA07hGtZX5p4iOEKgRK-_x4nPYI",
    authDomain: "satellite-617f2.firebaseapp.com",
    databaseURL: "https://satellite-617f2.firebaseio.com",
    projectId: "satellite-617f2",
    storageBucket: "satellite-617f2.appspot.com",
    messagingSenderId: "991179971792"
  };
  firebase.initializeApp(config);

  let database = firebase.database();

  function addSearchToFirebase(){
    let ref = database.ref('searches');
    let data = {
        satId : app.selected.satId,
        year : app.selectedYear,
        month : app.selectedMonth
    };
  
    ref.push(data);
  }

  
