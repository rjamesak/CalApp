var parsedURL = new URL(window.location.href);
var currentUser = new URL(window.location.href).searchParams.get("userID");
currentUserID=0

$(document).ready(function()
{
    getUser()

    $("#addExBtn").click(function(event)
    {
        var emptyflag = 0;
        event.preventDefault();
        console.log('add exercise submit button clicked');
        let name =  $('#name').val();
        let duration = $("#duration").val();
        let calories = $("#calories").val();

        let params = {'name':name, 'duration' : duration, 'calories' :calories };

        let trimmedName = name.trim();
        let trimmedDuration= duration.trim();

        if (trimmedName.length == 0  || trimmedDuration.length == 0)
        {
            console.log("empty fields");
            emptyflag = 1;
        }
        if(emptyflag)
        {
            console.log("did not submit, empty fields");
        }
        else
        {
            let req = new XMLHttpRequest();

            //if performing an edit instead of normal insert
            if(window.location.pathname === '/editExAddForm')
            {
                //add exercise ID to params and route to edit handler
                params.exerciseID = parsedURL.searchParams.get("id");
                req.open("POST", parsedURL.origin + '/editExercise', true);
            }
            else
            {
                //route to insert handler
                req.open("POST", parsedURL.origin + '/addExercise', true);
            }

            req.setRequestHeader("Content-type", "application/json");

            //add 'load' event listener for async
            req.addEventListener("load", function()
            {
                if(req.status >= 200 && req.status < 400)
                {
                    //go back to login page
                    //change this to interface and include the user ID
                    window.location.href = parsedURL.origin + '/interface' + '?userID=' + currentUser;
                }
                else {alert("server response error")};
            })
            req.send(JSON.stringify(params));
        }

    });

    //cancel button click
    $("#cancelAddEx").click(function(e)
    {
      e.preventDefault();
      console.log("user: " + currentUserID)
      var newUrl = window.location.origin
      newUrl+="/interface?userID=" + currentUserID
      console.log("response received after trying to add food, returning to: " + newUrl);

      window.location.href=newUrl

    })



})


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
