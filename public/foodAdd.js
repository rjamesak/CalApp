var parsedURL = new URL(window.location.href);
var serverHost = parsedURL.host;
var serverURL = 'http://' + serverHost;
//var currentUserID = document.getElementById('userID').textContent;
var currentUser = new URL(window.location.href).searchParams.get("userID");
//console.log('cur User: ' + currentUser);
currentSelectSpecialDietMenu=0
currentUserID=0

$(document).ready(function()
{
    getUser()

    document.getElementById('specialDietMenu').addEventListener('change', function(e)
    {
      currentSelectSpecialDietMenu = e.target.selectedIndex
      console.log("menu item selected: " + currentSelectSpecialDietMenu);
    });

    $("#addFoodBtn").click(function(event)
    {
        console.log('server URL: ');
        console.log(serverURL);
        var emptyflag = 0;
        event.preventDefault();
        console.log('add food submit button clicked');
        let name =  $('#name').val();
        let servingSize = parseInt($("#servingSize").val());
        let servingSizeUnits = $("#servingSizeUnits").val();
        let calories = parseInt($("#calories").val());
        let specialDietID = null

        console.log("special menu value: " + currentSelectSpecialDietMenu)

        if (currentSelectSpecialDietMenu == 1)
        {
          specialDietID="Vegan"
        }
        else if (currentSelectSpecialDietMenu == 2) {
           specialDietID="Vegetarian"
        }

        let params = {'name':name, 'servingSize' : servingSize, 'servingSizeUnits' :servingSizeUnits, 'calories' :calories, 'specialDietID' :specialDietID };

        let trimmedName = name.trim();
        let trimmedUnits = servingSizeUnits.trim();

        if (trimmedName.length == 0  || trimmedUnits.length == 0)
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

            //if editing instead of inserting
            if(window.location.pathname === '/editFoodAddForm')
            {
                params.foodID = parsedURL.searchParams.get("id");
                req.open("POST", parsedURL.origin + '/editFoods', true);
            }

            else
            {
                req.open("POST", serverURL + '/addFood', true);
            }

            req.setRequestHeader("Content-type", "application/json");

            //add 'load' event listener for async
            req.addEventListener("load", function()
            {
                if(req.status >= 200 && req.status < 400)
                {
                    //go back
                    console.log("user: " + currentUserID)
                    var newUrl = window.location.origin
                    newUrl+="/interface?userID=" + currentUserID
                    console.log("response received after trying to add food, returning to: " + newUrl);

                    window.location.href=newUrl
                }
                else {alert("server response error")};
            })
            req.send(JSON.stringify(params));

            console.log("sent this food to backend: " + JSON.stringify(params));
            //prevent page refresh
            //event.preventDefault();
        }

    });

    //cancel button click
    $("#cancelAddFood").click(function(e)
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
