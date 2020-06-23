var currentSelect=0
var lastItem=0
var progressBarProgress="69%"
var deleteTarget=0
var currentLogSelect=0
var lastLogSelect=0
var currenWeightSelect=0
var currentAcitivtyLogItemID=0
var currentActivityLogType=0
var currentCookBookIDSelection=0
var currentCookBookTypeSelection=0
var serverURL = 'http://flip1.engr.oregonstate.edu:44411/';


//JQUERY FRONT END STUFF HERE


$(document).ready(function()
{
  enableListItemHighlight();
  enableLogSelect();
  weightChart();
  calorieTotal()


  $("#deleteCookBookItem").prop("disabled", true);
  $("#editCookBookItem").prop("disabled", true);

  //call searchButton click when ENTER is pressed
  //in the searchText
  $('#searchText').on("keydown", function(event)
  {
    if (event.keyCode === 13)
    {
      event.preventDefault();
      document.getElementById('searchButton').click();
    }
  });


  $('#searchButton').click(function()
  {
    searchFunction()
  });


  $("#delLogButton").click(function()
  {
    if (currentSelect!=0)
    {
          alert("delete entry:" + currentSelect)
    }

  })


  //highlighting for food and exercise table
  $("#foodTableRows tr").click(function()
  {
    if(lastItem !== 0)
    {
      //remove highlighting and old text color from last selection
      lastItem.style.backgroundColor = "";
      lastItem.style.color="black"
    }
    //enable the edit/delete buttons
    $("#deleteCookBookItem").prop("disabled", false);
    $("#editCookBookItem").prop("disabled", false);
    this.style.backgroundColor = "#007bff";

    //change text Color
    this.style.color="white"

    lastItem = this;
    currentCookBookTypeSelection = this.cells[5].innerText
    currentCookBookIDSelection = this.cells[6].innerText




    console.log("selected a " + currentCookBookTypeSelection + " with id " + currentCookBookIDSelection)
  })

  //click user name to refresh the interface page
  $("#userHome").click(function()
  {
    console.log("user name clicked");
    var parsedURL = new URL(window.location.href);
    window.location.href = parsedURL.origin + '/interface?userID=' + parsedURL.searchParams.get("userID");

  });

  //switch user click function
  $("#switchUserBtn").click(function(e)
  {
    e.stopPropagation();
    var parsedURL = new URL(window.location.href);
    window.location.href = parsedURL.origin
  })

  //CANCEL button on log food form
  //return to interface page (page refresh)
  $("#cancelLogFood").click(function(e)
  {
    e.preventDefault();
    console.log(window.location.href);
    window.location.reload();
  })

  $("#debugTag").click(function(e)
  {
    console.log(window.location.origin);
  })

});


  //END JQUERY FRONT END STUFF








//***WORKING FUNCTIONS BEGIN


function enableListItemHighlight()
{

  $("#totalList li").click(function()
  {
    $("#deleteCookBookItem").prop("disabled", false);
    $("#editCookBookItem").prop("disabled", false);
    lastItem.className="list-group-item"
    currentSelect=this.id;
    this.className="list-group-item active"
    lastItem=this;
  });

}


function enableLogSelect()
{
  $("#delLogButton").prop("disabled", true);

  $(".logTableRow").click(function()
  {
    $("#delLogButton").prop("disabled", false);

    if (lastLogSelect !=0)
    {
          lastLogSelect.style.background=""
          lastLogSelect.style.color="black"
    }

    currentLogSelect=this.id
    this.style.backgroundColor="#007bff"
    this.style.color="white"
    lastLogSelect=this
    currentAcitivtyLogItemID = lastLogSelect.cells[7].innerText
    currentActivityLogType = lastLogSelect.cells[1].innerText

    console.log(currentActivityLogType + " log with sql id: " + currentAcitivtyLogItemID + " selected")


  });

}


function addWeight()
{
  var weightObject = new Object();

  newWeight = parseInt(document.getElementById("weightInputBox").value)

  today = document.getElementById("weightDateInputBox").value

  weightObject.weight=newWeight
  weightObject.date=today

  console.log("today: " + today)

  //send to backend
  var xhr = new XMLHttpRequest();
  xhr.open('POST', "/recordWeight", true);
  xhr.setRequestHeader("Content-type", "application/json");

  xhr.onreadystatechange = function()
  {
    if (xhr.readyState === 4)
    {
        weightChart()
    }
  }

  console.log("trying to send weight: " + JSON.stringify(weightObject))
  xhr.send(JSON.stringify(weightObject));
}


function weightChartDelete()
{

  var weightObject = new Object();
  weightObject = weightHistoryObject[currenWeightSelect]
  console.log("trying to delete weight: " + currenWeightSelect);

  //send to backend
  var xhr = new XMLHttpRequest();
  xhr.open('POST', "/deleteWeight", true);
  xhr.setRequestHeader("Content-type", "application/json");

  xhr.onreadystatechange = function()
  {
    if (xhr.readyState === 4)
    {
      Chart.helpers.each(Chart.instances, function (instance)
      {
             instance.destroy();
        });

      weightChart()
    }
  }

  console.log("trying to send weight: " + JSON.stringify(weightObject))
  xhr.send(JSON.stringify(weightObject));
}


function weightChart()
{

    Date.prototype.toDateInputValue = (function()
    {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
    });

    document.getElementById("weightDateInputBox").value = new Date().toDateInputValue();

    weightHistoryObject=0
    var weights = []
    var dates = []

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function()
    {
      if (xhr.readyState === 4)
      {
        // callback(xhr.response);
        //console.log("\ngot response:\n" + xhr.response);
        weightHistoryObject=JSON.parse(xhr.response)
        // console.log("\nfinal object value: " + weightHistoryObject[0].date +"\n");

        var i;
        for (i = 0; i < weightHistoryObject.length; i++)
        {
          // console.log("got: "+ weightHistoryObject[i].weight + "\n")
          // console.log("got: "+ weightHistoryObject[i].date + "\n")

          weights.push(weightHistoryObject[i].weight)
          dates.push(weightHistoryObject[i].date)
        }

        var backgroundColors = []
        var dataPointCount = weightHistoryObject.length
        currenWeightSelect = dataPointCount-1

        if (dataPointCount > 0)
        {
          var i=0;
          for (i=0; i < dataPointCount; i++)
          {
            if (i==currenWeightSelect)
            {
              backgroundColors.push("gold")
            }
            else
            {
            backgroundColors.push("rgba(0, 123, 255, 0.6)")
            }

          }

          var currentSelectedDate;
          var currentWeight;
          //set the initial latest value when page loads
          document.getElementById("weightReadout").innerText = weightHistoryObject[weightHistoryObject.length-1].date + " Weigh-in: " + weightHistoryObject[weightHistoryObject.length-1].weight + "lbs"

          //PUT CODE IN HERE TO POPULATE weights and dates from database

          var lineChart = new Chart(document.getElementById("weightChart"), {
          type: 'line',
          data: {
            labels: dates,
            datasets:
            [{
                data: weights,
                pointRadius:8,
                hoverRadius:17,
                label: "Pounds",
                borderColor: backgroundColors,
                borderWidth: 5,
                backgroundColor: "rgba(0, 123, 255, 0.6)",
                fill: true
            }]
          },
          options: {
            title: {
              display: true,
            },
            legend: {
              display: false
            }
          }
        });

          document.getElementById("weightChart").onclick = function (evt)
          {
                  var activePoints = lineChart.getElementsAtEventForMode(evt, 'point', lineChart.options);
                  var firstPoint = activePoints[0];

                  //console.log(firstPoint)

                  if (firstPoint)
                  {
                    //redo selection Colors
                    backgroundColors.fill("rgba(0, 123, 255, 0.6)")
                    backgroundColors[firstPoint._index] = "gold"
                    console.log(firstPoint._index)
                    currentSelectedDate = lineChart.data.labels[firstPoint._index];
                    currentWeight = lineChart.data.datasets[firstPoint._datasetIndex].data[firstPoint._index];
                    //alert(label + ": " + value);
                    currenWeightSelect=firstPoint._index;
                    lineChart.update();

                    document.getElementById("weightReadout").innerText = currentSelectedDate + " Weigh-in: " + currentWeight + "lbs"
                  }
          };
        }
        else
        {
          document.getElementById("weightReadout").innerText = "No weight value's to display"
        }
      }
    }

    xhr.open('GET', "/grabWeightData", true);
    xhr.send();
}


function calorieTotal()
{
  var xhr = new XMLHttpRequest();
  var calories = 1

  xhr.onreadystatechange = function()
  {
    if (xhr.readyState === 4)
    {


      console.log("front end got calorie value from server of: " + xhr.response)
      calories = JSON.parse(xhr.response)
      calories = calories.totalDailyCalories

      var dailycalLimit=2000
      var caloriesLeft
      var rawPercent = 0
      var i=0
      var calorieProgressBar = document.getElementById("calProgress")
      var calText = document.getElementById("calorieReadout")

      rawPercent = (calories/dailycalLimit)*100
      progressBarProgress = rawPercent + "%"

      caloriesLeft = dailycalLimit - calories;


      console.log("calorie stats: " + progressBarProgress + " " + caloriesLeft);

      if (rawPercent < 25)
      {
        calorieProgressBar.className="progress-bar progress-bar-striped bg-warning"
      }
      else if (rawPercent > 25 && rawPercent < 101)
      {
        calorieProgressBar.className="progress-bar progress-bar-striped bg-success"
      }
      else
      {
        calorieProgressBar.className="progress-bar progress-bar-striped bg-danger"
      }

      var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var dayName = days[new Date().getDay()]

      calText.innerText = dayName + ": " + calories + " / " + dailycalLimit + " kCal"


      $("#calProgress").animate(
        {
          width: progressBarProgress
        }, 250
      );

    }
  }


  xhr.open('GET', "/grabDailyCalories", true);
  xhr.send();

}


//***END WORKING FUNCTIONS












//***BEGIN Skeleton / not working functions / example / TODO



function removeFromCookBook()
{
  $("#delLogButton").prop("disabled", true);
  var table = document.getElementById("logTableBody");

  foodObject = new Object()
  foodObject.id = currentAcitivtyLogItemID
  console.log("current: " + currentAcitivtyLogItemID)

  //send to backend
  var xhr = new XMLHttpRequest();
  xhr.open('POST', "/removeFromLog", true);
  xhr.setRequestHeader("Content-type", "application/json");

  xhr.onreadystatechange = function()
  {
    if (xhr.readyState === 4)
    {
      location.reload();
    }
  }

  console.log("trying to send remove from activity log: " + JSON.stringify(foodObject))
  xhr.send(JSON.stringify(foodObject));
}





function removeFromLog()
{
  $("#delLogButton").prop("disabled", true);
  var table = document.getElementById("logTableBody");

  logObject = new Object()
  logObject.id = currentAcitivtyLogItemID
  logObject.type = currentActivityLogType

  console.log("current: " + currentAcitivtyLogItemID)

  //send to backend
  var xhr = new XMLHttpRequest();
  xhr.open('POST', "/removeFromLog", true);
  xhr.setRequestHeader("Content-type", "application/json");

  xhr.onreadystatechange = function()
  {
    if (xhr.readyState === 4)
    {
      location.reload();
    }
  }

  console.log("trying to send remove from activity log: " + JSON.stringify(logObject))
  xhr.send(JSON.stringify(logObject));
}






function addToCookBookFood()
{
  var parsedURL = new URL(window.location.href);
  var currentUser = parsedURL.searchParams.get("userID");
  window.location.href = parsedURL.origin + "/foodAddForm?userID=" + currentUser;

  //var mainWindow = document.getElementById("FoodAnExcerciseWindow")
  //var windowTitle = document.getElementById("cookBookTableTitle")
  //mainWindow.innerHTML=""
  //windowTitle.innerText="Add a Food to the Database"
  /*
  var xhr= new XMLHttpRequest();
  xhr.open('GET', serverURL+'foodAddForm', true);
  xhr.onreadystatechange= function() {
    if (this.readyState!==4) return;
    if (this.status!==200) return; // or whatever error handling you want
    //mainWindow.innerHTML= this.responseText;
  };
  xhr.send();
  */
}


function addToCookBookExcercise()
{
  var parsedURL = new URL(window.location.href);
  var currentUser = parsedURL.searchParams.get("userID");
  window.location.href = parsedURL.origin + "/exAddForm?userID=" + currentUser;


  /*
  var mainWindow = document.getElementById("FoodAnExcerciseWindow")
  var windowTitle = document.getElementById("cookBookTableTitle")
  mainWindow.innerHTML=""
  windowTitle.innerText="Add an Excercise to the Database"
  var xhr= new XMLHttpRequest();
  xhr.open('GET', 'exAdd.html', true);
  xhr.onreadystatechange= function()
  {
    if (this.readyState!==4) return;
    if (this.status!==200) return; // or whatever error handling you want
    mainWindow.innerHTML= this.responseText;
  };
  xhr.send();
  */
}



function editCookBookItem()
{
  var parsedURL = new URL(window.location.href);
  var currentUser = parsedURL.searchParams.get("userID");


  //IF FOOD
  if(currentCookBookTypeSelection === "Food")
  {
    window.location.href = parsedURL.origin + '/editFoodAddForm?id=' + currentCookBookIDSelection + '&userID=' + currentUser;
  }

  //IF EXERCISE
  console.log("currentCookBookType in edit function: ");
  console.log(currentCookBookTypeSelection);
  if(currentCookBookTypeSelection === "Exercise")
  {
    //get request to edit exercises
    window.location.href = parsedURL.origin + '/editExAddForm?id=' + currentCookBookIDSelection + '&userID=' + currentUser;
  };



  /*
  var mainWindow = document.getElementById("FoodAnExcerciseWindow")
  var windowTitle = document.getElementById("cookBookTableTitle")
  mainWindow.innerHTML=""

  windowTitle.innerText="Edit a Food in the Database"



  var xhr= new XMLHttpRequest();
  xhr.open('GET', 'http://web.engr.oregonstate.edu/~brynmool/foodAdd.html', true);
  xhr.responseType = "document";
  xhr.onreadystatechange= function()
  {
    if (this.readyState!==4) return;
    if (this.status!==200) return;

    var parser = new DOMParser();
    var doc = parser.parseFromString(request.responseText, "text/html");
    var elem = doc.getElementById("div1");
    alert(elem.innerHTML);



    mainWindow.innerHTML = doc

  };
  xhr.send();
  */



  // var nameField = mainWindow.document.getElementById("name")
  // var servingsizeNumber = document.getElementById("servingSize")
  // var servingSizeUnitString = document.getElementById("servingSizeUnits")
  // var caloriesNumber = document.getElementById("calories")
  //
  // //$("#").val('2') //id number for special diet should just drop in her
  //
  // nameField.value = "food name from db"
  // console.log(nameField)
  // servingsizeNumber=666
  // servingSizeUnitString="pentagrams"
  // caloriesNumber=420

}



function removeFromCookBook()
{
  $("#deleteCookBookItem").prop("disabled", true);
  var table = document.getElementById("totalList");

  logObject = new Object()
  logObject.id = currentCookBookIDSelection
  logObject.type = currentCookBookTypeSelection

  //send to backend
  var xhr = new XMLHttpRequest();
  xhr.open('POST', "/removeFromCookBook", true);
  xhr.setRequestHeader("Content-type", "application/json");

  xhr.onreadystatechange = function()
  {
    if (xhr.readyState === 4)
    {
      location.reload();
    }
  }

  console.log("trying to send remove from cookbook log: " + JSON.stringify(logObject))
  xhr.send(JSON.stringify(logObject));
}




function foodLogAdd()
{


}



//***END Skeleton / not working functions / example / TODO








//FUNCTIONS LYDIA IS WORKING ON, try not to change without asking


//END LYDIA FUNCTIONS











//FUNCTIONS JAMES IS WORKING ON, try not to change without asking

  //*** LYDIA NOTE, feel free to move this to the working section when you're finished

//user ID from a p tag in Interface html
function searchFunction()
{
  var currentUserID = document.getElementById('userID').textContent;
  input = document.getElementById('searchText').value
  console.log("Search sql for: " + input + "userID: " + currentUserID);
  //alert("Search sql for: " + input + " userID: " + currentUserID);

  $("#deleteCookBookItem").prop("disabled", true);

  console.log(window.location.href);
  let baseURL = new URL(window.location.href).host;
  console.log("origin: " + baseURL);
  let redirectString = "http://" + baseURL +'/search?userID=' + currentUserID + '&searchName=' + input;
  console.log("redirect: " + redirectString);
  window.location.href = redirectString;


  /*
  var listSizeLimit = 5
  var fetchedCount  = 0

  var i;
  for (i=0; i < fetchedCount && i < listSizeLimit; i++)
  {
    var newListItem = document.createElement("li")
    var textValue = document.createTextNode("VALUE FROM DB")
    newListItem.appendChild(textValue)
    newListItem.className = "list-group-item"
    newListItem.id="cookBookItem" + i
    document.getElementById("totalList").appendChild(newListItem)
  }

  document.getElementById('searchText').value=""
  */
}




//END JAMES FUNCTIONS
