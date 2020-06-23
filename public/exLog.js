var exIds=[]
var currentMenuSelection=0
var currentUserID=0

$(document).ready(function()
{
  setDateDefaultToday();
  getExIds()
  getUser()

  document.getElementById("logExButton").addEventListener("click", function(event)
  {
  event.preventDefault()
  sendEx()
  });

  document.getElementById('name').addEventListener('change', function(e)
  {
    currentMenuSelection = e.target.selectedIndex
    console.log("menu item selected: " + currentMenuSelection);
  });

  //cancel button click
  $("#cancelLogEx").click(function(e)
  {
      e.preventDefault();
      console.log("user: " + currentUserID)
      var newUrl = window.location.origin
      newUrl+="/interface?userID=" + currentUserID
      console.log("response received after trying to add food, returning to: " + newUrl);

      window.location.href=newUrl
  })

});



function getUser()
{
  var xhr = new XMLHttpRequest();
  xhr.open('POST', "/getCurrentUser", true);
  xhr.setRequestHeader("Content-type", "application/json");

  xhr.onreadystatechange = function()
  {
    if (xhr.readyState === 4)
    {
        currentUserID=xhr.response
        console.log("backend says current user= " + currentUserID);
    }
  }

  xhr.send();
}



function setDateDefaultToday()
{
  Date.prototype.toDateInputValue = (function()
  {
  var local = new Date(this);
  local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
  return local.toJSON().slice(0,10);
  });

  document.getElementById("date").value = new Date().toDateInputValue();
}



function getUser()
{
  var xhr = new XMLHttpRequest();
  xhr.open('POST', "/getCurrentUser", true);
  xhr.setRequestHeader("Content-type", "application/json");

  xhr.onreadystatechange = function()
  {
    if (xhr.readyState === 4)
    {
        currentUserID=xhr.response
        console.log("backend says current user= " + currentUserID);
    }
  }

  xhr.send();
}




function sendEx()
{
  var exObject = new Object();

  exObject.duration = parseInt(document.getElementById("duration").value)
  exObject.date = document.getElementById("date").value
  exObject.id = exIds[currentMenuSelection].exerciseID
  exObject.name = document.getElementById("name").value

  console.log("sending exercise object: " + JSON.stringify(exObject))

  //send to backend

  var xhr = new XMLHttpRequest();
  xhr.open('POST', "/logExData", true);
  xhr.setRequestHeader("Content-type", "application/json");

  xhr.onreadystatechange = function()
  {
    if (xhr.readyState === 4)
    {
        console.log("user: " + currentUserID)
        var newUrl = window.location.origin
        newUrl+="/interface?userID=" + currentUserID
        console.log("response received after trying to add food, returning to: " + newUrl);

        window.location.href=newUrl
    }
  }

  console.log("trying to send food to log: " + JSON.stringify(exObject))
  xhr.send(JSON.stringify(exObject));
}



function getExIds()
{
  //SQL querry here to get all the IDs

  var xhr = new XMLHttpRequest();
  xhr.open('POST', "/getExIDs", true);
  xhr.setRequestHeader("Content-type", "application/json");

  xhr.onreadystatechange = function()
  {
    if (xhr.readyState === 4)
    {
        exIds = JSON.parse(xhr.response)
        console.log("got this when asked for a list of exercise ID's: " + JSON.stringify(exIds) );
    }
  }

  console.log("asking backend for list of exercise ID's")
  xhr.send();
}
