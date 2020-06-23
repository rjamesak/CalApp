var foodIds=[]
var currentMenuSelection=0
var currentUserID=0



$(document).ready(function()
{
  setDateDefaultToday();
  getFoodIds()
  getUser()

  document.getElementById("logFoodButton").addEventListener("click", function(event)
  {
  event.preventDefault()
  sendFood()
  });


  //cancel button click
  $("#cancelLogFood").click(function(e)
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



function sendFood()
{
  var foodObject = new Object();

  foodObject.servings = parseInt(document.getElementById("servings").value)
  foodObject.meal = document.getElementById("mealMenu").value
  foodObject.date = document.getElementById("date").value
  //foodObject.id = foodIds[currentMenuSelection].foodID
  foodObject.id = document.getElementById("name").value

  console.log("sending food object: " + JSON.stringify(foodObject))

  //send to backend

  var xhr = new XMLHttpRequest();
  xhr.open('POST', "/addFoodLog", true);
  xhr.setRequestHeader("Content-type", "application/json");

  xhr.onreadystatechange = function()
  {
    if (xhr.readyState === 4)
    {
        console.log("response received after trying to add food");

        console.log("user: " + currentUserID)
        var newUrl = window.location.origin
        newUrl+="/interface?userID=" + currentUserID
        console.log("response received after trying to add food, returning to: " + newUrl);

        window.location.href=newUrl
    }
  }

  console.log("trying to send food to log: " + JSON.stringify(foodObject))
  xhr.send(JSON.stringify(foodObject));
}



function getFoodIds()
{
  //SQL querry here to get all the IDs

  var xhr = new XMLHttpRequest();
  xhr.open('POST', "/getFoodIDs", true);
  xhr.setRequestHeader("Content-type", "application/json");

  xhr.onreadystatechange = function()
  {
    if (xhr.readyState === 4)
    {
        foodIds = JSON.parse(xhr.response)
        console.log("got this when asked for a list of food ID's: " + JSON.stringify(foodIds) );
    }
  }

  console.log("asking backend for list of food ID's")
  xhr.send();
}
