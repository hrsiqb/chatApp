
var interval = ''
var name = ''
var email = ''
var uId = ''
var toUId = ''
var numberOfUsers = 0;
var numberOfAppendedUsers = 0;
var msgCount = []
var typingStatus = 0
var typingTimeout = ''
var numberOfMessages = 0;
var numberOfAppendedMessages = 0;
var firstRun = true;
var defaultPhotoURL = "Images/user.jpg"
var defaultDisplayName = sessionStorage.getItem("name")
var displayName = ''
var photoURL = defaultPhotoURL
var action_login = false;
$( document ).ready(function() {

  // Event listener in case of internet disconnection
  window.addEventListener('offline', () => location.href = "noInternet.html");
});

var firebaseConfig = {
  apiKey: "AIzaSyCLRGkoru_316WBf8xOAuLGjbo6omU9opk",
  authDomain: "chatapp-97c46.firebaseapp.com",
  databaseURL: "https://chatapp-97c46.firebaseio.com",
  projectId: "chatapp-97c46",
  storageBucket: "chatapp-97c46.appspot.com",
  messagingSenderId: "292347888679",
  appId: "1:292347888679:web:9796088fb5e9d16c7f7a02",
  measurementId: "G-CF0P35403J"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

function ifLoggedIn(){
  document.getElementById("section").style.display = "flex"
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      displayName = user.displayName;
      email = user.email;
      var emailVerified = user.emailVerified;
      if(user.photoURL) photoURL = user.photoURL;
      var isAnonymous = user.isAnonymous;
      uId = user.uid;
      var providerData = user.providerData;

      // if(displayName !== null){//if name is set in the session, it means that a user is registered
      //   sessionStorage.clear()

      //   let data = {
      //     name: displayName,
      //     email: email,
      //     key: uId,
      //     lastActivity: 0
      //   }
      //   //Insert User's data into Database
      //   firebase.database().ref(`Users/${uId}`).set(data)//set means that we dont want to overwrite the data but save in the same key as we did above, we used push above now we have to use set here
      //   .then((result) => {
      //     //If operation is completed, get all users data and append on dashboard
      //     getNumberOfUsers()
      //   })
      //   .catch(function(error){
      //     errorHandler(error)
      //   }) 
      // }
      // else{//if name is not set in the session, it means that the user is logged in
      //   getNumberOfUsers()
      // }
      getUsers()
    }
    else {
      // User is signed out.
      location.href = "Login.html"
    }
    });
}
function appendUsers(){
  firebase.database().ref('Users').on("child_added", function(data){//once means,run this function only once. value refers to => Run this function when the value is updated. data=>received data from database
    var data = data.val()
    var dataObj = data
    var objName = dataObj.name
    var objEmail = dataObj.email
    var objPhotoURL = dataObj.photoUrl
    if(dataObj.key === uId){
      action_login = true;
      document.getElementById("currentNameB").innerHTML = objName
      document.getElementById("currentName").innerHTML = objName
      document.getElementById("currentEmail").innerHTML = objEmail
    }
    else{
      let usersHTML = `<li style="border-bottom: 1px solid rgba(83, 82, 82, 0.2); list-style-type: none;`
      usersHTML += `max-width: 30vw;min-height: 50px; display: flex; flex-direction: row; justify-content:` 
      usersHTML += `space-between; padding: 10px;" id="${dataObj.key}" onclick="startChat(this)"`
      usersHTML += `class="usersLi">`
      usersHTML += `<div style="display: flex; flex-direction: row;">`
      usersHTML += `<div style="display: flex; margin-right: 15px; position: relative;">`
      usersHTML += `<img src='${objPhotoURL}' style="border-radius: 50%;" width="50px" height="50px">`
      usersHTML += `<div class='status-circle'></div>`
      usersHTML += `</div>`
      usersHTML += `<div style="display: flex; flex-direction: column; justify-content: center;">`
      usersHTML += `<p style="margin: 0; font-size: 20px;">${objName}</p>`
      usersHTML += `<p style="margin: 0; color: #a4a4a4;">${objEmail}</p>`
      usersHTML += `</div>`
      usersHTML += `</div>`
      usersHTML += `<div style="display: flex; flex-direction: row; align-items: center;">`
      usersHTML += `<span class="badge badge-success" style="margin-top: 2px; border-radius: 50%;"></span>`
      usersHTML += `<p style="margin: 5px; color: #a4a4a4;"></p>`
      usersHTML += `</div>`
      usersHTML += `</li>`
      document.getElementById("usersUl").innerHTML += usersHTML
      numberOfAppendedUsers++
      msgCount[dataObj.key] = 0
    }
    if(numberOfAppendedUsers === numberOfUsers-1){
      if(!action_login){
        if(defaultDisplayName !== null){
          name = defaultDisplayName 
          sessionStorage.clear()
        }
        else name = displayName
        
        let data = {
          name: name,
          email: email,
          key: uId,
          lastActivity: 0,
          typing: 0,
          photoUrl: photoURL
        }
        //Insert User's data into Database
        firebase.database().ref(`Users/${uId}`).set(data)//set means that we dont want to overwrite the data but save in the same key as we did above, we used push above now we have to use set here
        .then((result) => {
        })
        .catch(function(error){
          errorHandler(error)
        }) 
      }
      document.getElementById("userPhoto").src = photoURL
      updateLastActivity()
      setAutoUpdateMessages()
      interval = setInterval(updateLastActivity,3000)
    }
  })
}
function errorHandler(error){
  let response = document.getElementById("result")
  var errorCode = error.code;
  var errorMessage = error.message;
  response.innerHTML = errorMessage
  document.getElementById("section").style.display = "none"
  response.className = "alert alert-danger"
  response.style.display = "flex"
  setTimeout(timeout, 3000)
}

function register(){
  let name = document.getElementById("nameReg").value
  if(!(name === '')){
    let email = document.getElementById("emailReg").value
    let password = document.getElementById("pswdReg").value
    document.getElementById("section").style.display = "flex"
    
    sessionStorage.setItem("name", name);

    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((result) => {
    })
  
    .catch(function(error) {
      // Handle Errors here.
        errorHandler(error)
    });
  }
  else {
    response.innerHTML = "Please Enter Your Name"
    response.className = "alert alert-danger"
    response.style.display = "flex"
    setTimeout(timeout, 3000)
  }
}
function getUsers(){
  firebase.database().ref('Users').once("value", function(data){//once means,run this function only once. value refers to => Run this function when the value is updated. data=>received data from database
    var data = data.val()
    for(var property in data){//run this loop as long as the data has some property
        if(data.hasOwnProperty(property)){//check if this is its own proeprty
          numberOfUsers++
        }
    }
    appendUsers()
  })
}
function updateLastActivity(){
  let lastActivity = new Date().getTime()
  firebase.database().ref(`Users/${uId}/lastActivity`).set(lastActivity)
  getLastActivity(lastActivity)
}
function getLastActivity(currentTime){
  firebase.database().ref('Users').once("value", function(data){//once means,run this function only once. value refers to => Run this function when the value is updated. data=>received data from database
    var data = data.val()
    for(var property in data){//run this loop as long as the data has some property
      if(data.hasOwnProperty(property)){//check if this is its own proeprty
        let lastActivity = data[property].lastActivity
        let typingStatusFlag = data[property].typing
        if(property === uId){}
        else{
          let status = document.getElementById(property).firstChild.firstChild.childNodes[1]
          
          if(lastActivity >= (currentTime-4000)) status.style.backgroundColor = "rgb(28, 175, 28)"
          else status.style.backgroundColor = "grey"
          
          if(typingStatusFlag === uId) document.getElementById(property).childNodes[1].childNodes[1].innerHTML = 'typing...'
          else document.getElementById(property).childNodes[1].childNodes[1].innerHTML = ''
        }
      }
    }
  })
}
function loginWithFacebook(){
  var provider = new firebase.auth.FacebookAuthProvider();
  firebase.auth().signInWithRedirect(provider);
  firebase.auth().getRedirectResult().then(function(result) {
    if (result.credential) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token = result.credential.accessToken;
      // ...
    }
    // The signed-in user info.
    var user = result.user;
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
  });
}
function loginWithGoogle(){
  // Google Auth Config
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithRedirect(provider);
  firebase.auth().getRedirectResult().then(function(result) {
    if (result.credential) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // ...
    }
    // The signed-in user info.
    var user = result.user;
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
  });
}
function login(){
    let email = document.getElementById("emailReg").value
    let password = document.getElementById("pswdReg").value
    let response = document.getElementById("result")
    document.getElementById("section").style.display = "flex"

  firebase.auth().signInWithEmailAndPassword(email, password)
  .then((result) => {
      document.getElementById("section").style.display = "none"
      document.getElementById("emailReg").value = ''
      document.getElementById("pswdReg").value = ''
      response.innerHTML = "Login Successful"
      response.className = "alert alert-success"
      response.style.display = "flex"
      setTimeout(timeout, 3000)
  })
  
  .catch(function(error) {
  // Handle Errors here.
          errorHandler(error)
});
}
function logout(){
    document.getElementById("section").style.display = "flex"
    firebase.auth().signOut()
    .then(function() {
        document.getElementById("section").style.display = "none"
      }, 
      function(error) {
      response.innerHTML = error
      document.getElementById("section").style.display = "none"
      response.className = "alert alert-danger"
      response.style.display = "flex"
      setTimeout(timeout, 3000)
      });
}
function timeout(){
    let response = document.getElementById("result")
    response.style.display = "none"
}  
function startChat(id){ 
  let li = id.parentNode
  for(var i=0; i<numberOfUsers-1; i++){
    if(li.childNodes[i].className === 'active') li.childNodes[i].className = 'usersLi'
  }   
  id.className = "active"
  
  document.getElementById("messagesDiv").innerHTML = 
  `<div id="messagesContainer"><div id="messagesPanel"></div></div>
  <div id="writeMessagePanel">
      <input type="text" name="newMessage" class="form-control" onkeyup="typing()" id="newMessage" placeholder="Type a message">
      <button class="btn btn-success sendBtn" id="sendBtn" onclick="sendMessage(this)"><b>></b></button>
  </div>`

  let toUserName = id.firstChild.childNodes[1].firstChild.innerHTML
  let toUserId = id.id
  toUId = toUserId
  document.getElementById("sendBtn").id = `sendBtn_${toUserId}`
  
  document.getElementById("newMessage").addEventListener('keydown', (id) => {
    if(id.code === "Enter") sendMessage(document.getElementById(`sendBtn_${toUserId}`))
  });
  
  getMessages(toUserId)
}
function getMessages(toUserId){
  firebase.database().ref('Messages').once("value", function(data){//once means,run this function only once. value refers to => Run this function when the value is updated. data=>received data from database
  var data = data.val()
  
  let messagesPanel = document.getElementById("messagesPanel")
  
  for(var property in data){//run this loop as long as the data has some property
    if(data.hasOwnProperty(property)){//check if this is its own proeprty
      if(data[property].fromUserId === uId && data[property].toUserId === toUserId){
        messagesPanel.innerHTML += `<div style="margin: 10px 0; display:flex; flex-direction:row; justify-content: flex-end;"><span class="sentMessage" style='float:right'>${data[property].message}</span><div class="sentTail" style='float:right'></div></div>`
      }
      else if(data[property].toUserId === uId && data[property].fromUserId === toUserId){
        messagesPanel.innerHTML += `<div style="margin: 10px 0; display:flex; flex-direction:row;"><div class="receivedTail"></div><span class="receivedMessage" style='float:left;'>${data[property].message}</span></div>`
        firebase.database().ref(`Messages/${property}/readFlag`).set(0)//set means that we dont want to overwrite the data but save in the same key as we did above, we used push above now we have to use set here
          .then((result) => {
            if(msgCount[data[property].fromUserId] > 0){ 
              msgCount[data[property].fromUserId]--
              document.getElementById(data[property].fromUserId).childNodes[1].firstChild.innerHTML = msgCount[data[property].fromUserId]
            }
          })
          .catch(function(error){
            errorHandler(error)
          })  
      }
    }
  }
  msgCount[toUserId] = 0
  document.getElementById(toUserId).childNodes[1].firstChild.innerHTML = '' 
  messagesPanel.scrollIntoView(false)
})
}
function sendMessage(id){
  let newMessage = document.getElementById("newMessage")
  if(newMessage.value !== ''){
    let key = firebase.database().ref('Messages').push().key //generate a key for the Messages object
    let data = {
      message: newMessage.value,
      toUserId: id.id.substring(id.id.indexOf('_')+1, id.id.length),
      fromUserId: uId,
      key: key,
      readFlag: 1
    }
    newMessage.value = ''
    firebase.database().ref(`Messages/${key}`).set(data)//set means that we dont want to overwrite the data but save in the same key as we did above, we used push above now we have to use set here
      .then((result) => {
      })
      .catch(function(error){
        errorHandler(error)
      })
  }
}
function setAutoUpdateMessages(){
  //get number of messages
  firebase.database().ref('Messages').once("value", function(data){//once means,run this function only once. value refers to => Run this function when the value is updated. data=>received data from database
    var data = data.val()
    
    for(var property in data){//run this loop as long as the data has some property
      if(data.hasOwnProperty(property)){//check if this is its own proeprty
        numberOfMessages++
      }
    }
    //set auto update of messages
    firebase.database().ref('Messages').on("child_added", function(data){//once means,run this function only once. value refers to => Run this function when the value is updated. data=>received data from database
      var data = data.val()
      let messagesPanel = document.getElementById("messagesPanel")
      let dataObj = data
      if(dataObj.fromUserId === uId && dataObj.toUserId === toUId){
        messagesPanel.innerHTML += `<div style="display:flex; flex-direction:row; justify-content: flex-end;"><span class="sentMessage" style='float:right'>${dataObj.message}</span><div class="sentTail" style='float:right'></div></div><br>`
        messagesPanel.scrollIntoView(false)
      }
      else if(dataObj.toUserId === uId && dataObj.fromUserId === toUId){
        firebase.database().ref(`Messages/${dataObj.key}/readFlag`).set(0)//set means that we dont want to overwrite the data but save in the same key as we did above, we used push above now we have to use set here
        .then((result) => {
          msgCount[dataObj.fromUserId] = 0
          document.getElementById(dataObj.fromUserId).childNodes[1].firstChild.innerHTML = ''
        })
        .catch(function(error){
          errorHandler(error)
        })
        messagesPanel.innerHTML += `<div style="display:flex; flex-direction:row;"><div class="receivedTail"></div><span class="receivedMessage" style='float:left;'>${dataObj.message}</span></div><br>`
        messagesPanel.scrollIntoView(false)
      }

      if(dataObj.toUserId === uId && dataObj.readFlag === 1){
        if(!document.getElementById(`sendBtn_${dataObj.fromUserId}`)){
          msgCount[dataObj.fromUserId]++
          document.getElementById(dataObj.fromUserId).childNodes[1].firstChild.innerHTML = msgCount[dataObj.fromUserId]
        }
        else{
          msgCount[dataObj.fromUserId] = 0
          document.getElementById(dataObj.fromUserId).childNodes[1].firstChild.innerHTML = ''
        }
      }
      if(firstRun){
        numberOfAppendedMessages++
        if(numberOfAppendedMessages === numberOfMessages){
          firstRun == false
          document.getElementById("section").style.display = "none"
        }
      }
    })
  })
}
function typing(){
  clearTimeout(typingTimeout)
  typingTimeout = setTimeout(() => {
    firebase.database().ref(`Users/${uId}/typing`).set(0)//set means that we dont want to overwrite the data but save in the same key as we did above, we used push above now we have to use set here
    .then((result) => {
      typingStatus = 0
    })
    .catch(function(error){
      errorHandler(error)
    })
  }, 1000);
  if(!typingStatus){
    typingStatus = 1
    firebase.database().ref(`Users/${uId}/typing`).set(toUId)//set means that we dont want to overwrite the data but save in the same key as we did above, we used push above now we have to use set here
    .then((result) => {
    })
    .catch(function(error){
      errorHandler(error)
    })
  }
}