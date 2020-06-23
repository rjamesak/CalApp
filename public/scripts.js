var currentSelect=0
var lastItem=0
var progressBarProgress="69%"
var deleteTarget=0

var currentLogSelect=0
var lastLogSelect=0

var currenWeightSelect=0

var exampleWeight= [180, 125, 145]
var exampleDates = ["12/21/2019", "01/04/2020", "02/22/2020"]

var serverURL = "http://flip1.engr.oregonstate.edu:44411/";


$(document).ready(function()
{

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


  $('#conflictsButton').popover({
      html : true,
      content: function()
      {
        return $('#logList').html();
      }
  });

  enableListItemHighlight();
  enableLogSelect();
  weightChart();
  //checkDietConflicts();
  //calorieTotal()





  $("#delLogButton").click(function()
  {
    if (currentSelect!=0)
    {
          alert("delete entry:" + currentSelect)
    }

  })




  //highlighting for food and exercise table
  $("#foodTableRows tr").click(function() {
    if(lastItem !== 0) {//remove highlighting from last selection
      lastItem.style.backgroundColor = "";
    }
    //enable the edit/delete buttons
    $("#deleteCookBookItem").prop("disabled", false);
    $("#editCookBookItem").prop("disabled", false);
    this.style.backgroundColor = "#007bff";
    lastItem = this;
  })


});




function enableListItemHighlight()
{

  $("#totalList li").click(function()
  {
    $("#deleteCookBookItem").prop("disabled", false);
    $("#editCookBookItem").prop("disabled", false);
    lastItem.className="list-group-item"
    //alert(this.innerText);
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

  });

}

function calorieTotal()
{
  //TODO SQL code here
  var logFoods = []
  var itemCount = logFoods.length
  var runningTotal=0
  var dailycalLimit=1800
  var currentPercent=0
  var caloriesLeft
  var i=0
  var calorieProgressBar = document.getElementById("calProgress")
  var calText = document.getElementById("calorieReadout")

  for (i=0; i <itemCount; i++)
  {
    runningTotal += logFoods[i].calories  //should this be calories * servings?
  }

  rawPercent = (runningTotal/dailycalLimit)*100
  progressBarProgress = rawPercent + "%"
  caloriesLeft = dailycalLimit - runningTotal;


  console.log(rawPercent, currentPercent, caloriesLeft);

  calorieProgressBar.innerText = caloriesLeft + " Calories Remaining"

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

  calText.innerText = dayName + ": " + runningTotal + " / " + dailycalLimit + " kCal"



  $("#calProgress").animate(
    {
      width: progressBarProgress
    }, 500);
}

function checkDietConflicts()
{
  //TODO SQL code here

  var userDiet=0  //grab from sql, 0 = normal, 1=vegeterian, 2=vegan
  var foods = []
  var itemCount = foods.length
  var violationCount=0;
  var violationIDarray=[]
  var badflag=0

  var conflictsPopoverButton = document.getElementById("conflictsButton")
  var conflictsList = document.getElementById("logList")

  //clear out the old list of conflicts if any
  conflictsList.innerHTML=""

  var i=0

  if (userDiet !=0)
  {
    for (i=0; i<itemCount; i++)
    {
      badflag=0;

      if (userDiet==1 && foods[i].specialDietID==0)
      {
        violationCount++
        violationIDarray.push(foods[i].foodID)
        badflag=1;
      }
      else if (userDiet==2 && foods[i].specialDietID<2)
      {
        violationCount++
        violationIDarray.push(foods[i].foodID)
        badflag=1
      }

      if (badflag)
      {
        var newListItem = document.createElement("li")
        var textValue = document.createTextNode(foods[i].name)
        newListItem.appendChild(textValue)
        newListItem.className = "list-group-item"
        newListItem.id="conflictItem" + i
        conflictsList.appendChild(newListItem)
      }
    }
  }

  //adjust popover button color for number of conflicts
  if (violationCount==0)
  {
    conflictsButton.className="btn btn-success"

    var newListItem = document.createElement("li")
    var textValue = document.createTextNode("No Diet Conflicts!")
    newListItem.appendChild(textValue)
    newListItem.className = "list-group-item"
    newListItem.id="conflictItem" + i
    conflictsList.appendChild(newListItem)

  }
  else
  {
    if (violationCount>0 && violationCount <4)
    {
      conflictsButton.className="btn btn-warning"
    }
    else
    {
        conflictsButton.className="btn btn-danger"
    }
  }



  //updating number on diet conflicts button
  document.getElementById("dietConflictNumBadge").innerText=violationCount
}


function removeFromCookBook()
{
  var deleteName = document.getElementById(currentSelect).innerHTML
  alert("send sql query to delete " + deleteName)

  //send sql querry

  //update list now
  document.getElementById("totalList").innerHTML = " ";
  populateCookBook()
  enableListItemHighlight();
  $("#deleteCookBookItem").prop("disabled", true);
  console.log("yeah")
  $("#editCookBookItem").prop("disabled", true);
}

function removeFromLog()
{
  $("#delLogButton").prop("disabled", true);
  var table = document.getElementById("logTableBody");
  table.innerHTML = " ";
  populateFoodLog();
  enableLogSelect();

}

function populateFoodLog()
{
    $("#delLogButton").prop("disabled", true);
    var listSizeLimit = 3
    var fetchedCount  = 0
    //SQL QUERRY TO GET STUFF

    var i;
    for (i=0; i < listSizeLimit; i++)
    {
      var tableBody = document.getElementById("logTableBody")
      var newRow = tableBody.insertRow(i);
      newRow.id="logRow" + i;
      newRow.className="logTableRow"

      var cell1 = newRow.insertCell(0);
      var cell2 = newRow.insertCell(1);
      var cell3 = newRow.insertCell(2);
      var cell4 = newRow.insertCell(3);
      var cell5 = newRow.insertCell(4);
      cell5.style="display:none"

      cell1.innerHTML = "VALUE FROM DB";
      cell2.innerHTML = "VALUE FROM DB";
      cell3.innerHTML = "VALUE FROM DB";
      cell4.innerHTML = "VALUE FROM DB";
      cell5.innerHTML = "VALUE FROM DB";
    }

    calorieTotal()
    checkDietConflicts()

}

function populateCookBook()
{
  $("#deleteCookBookItem").prop("disabled", true);
  var listSizeLimit = 5
  var fetchedCount  = 0
  //SQL QUERRY TO GET STUFF

  var i;
  for (i=0; i < listSizeLimit; i++)
  {
    var newListItem = document.createElement("li")
    var textValue = document.createTextNode("VALUE FROM DB")
    newListItem.appendChild(textValue)
    newListItem.className = "list-group-item"
    newListItem.id="cookBookItem" + i
    document.getElementById("totalList").appendChild(newListItem)
  }



}

function addWeight()
{
  weight = parseInt(document.getElementById("weightInputBox").value)

  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = mm + '/' + dd + '/' + yyyy;

  //JUST FOR THE EXAMPLE, REMOVE WHEN REAL DATA IS ADDED TO SQL
  exampleWeight.push(weight)
  exampleDates.push(today)


  document.getElementById("weightInputBox").value=""
   //console.log(today)
   //console.log(weight)

  //today is in string format and weight is in it format ready to be sent to sql server
  weightChart()

}


function weightChartDelete()
{

  //for the example data only
  console.log(currenWeightSelect);
  console.log(exampleWeight);
  console.log(exampleDates);
  exampleDates.splice(currenWeightSelect, 1)
  exampleWeight.splice(currenWeightSelect, 1);

  console.log(currenWeightSelect);
  console.log(exampleWeight);
  console.log(exampleDates);
  //DO SQL REMOVAL HERE, currenWeightSelect contains index of weight to remove so we can just match that to the SQL index
  Chart.helpers.each(Chart.instances, function (instance) {
         instance.destroy();
    });

  weightChart()
}



function weightChart()
{

  var backgroundColors = []
  var dataPointCount = exampleDates.length
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
    document.getElementById("weightReadout").innerText = exampleDates[exampleDates.length-1] + " Weigh-in: " + exampleWeight[exampleWeight.length-1] + "lbs"

    //PUT CODE IN HERE TO POPULATE weights and dates from database

    var lineChart = new Chart(document.getElementById("weightChart"), {
    type: 'line',
    data: {
      labels: exampleDates,
      datasets:
      [{
          data: exampleWeight,
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

function addToCookBookFood()
{
  console.log("test adding food to db")

  var mainWindow = document.getElementById("FoodAndExerciseWindow")
  var windowTitle = document.getElementById("cookBookTableTitle")
  mainWindow.innerHTML=""

  windowTitle.innerText="Add a Food to the Database"

  var xhr= new XMLHttpRequest();
  xhr.open('GET', 'foodAdd.html', true);
  xhr.onreadystatechange= function() {
    if (this.readyState!==4) return;
    if (this.status!==200) return; // or whatever error handling you want
    mainWindow.innerHTML= this.responseText;
  };
  xhr.send();
}

function addToCookBookExcercise()
{
  console.log("change cookbook window test")

  var mainWindow = document.getElementById("FoodAndExerciseWindow")
  var windowTitle = document.getElementById("cookBookTableTitle")
  mainWindow.innerHTML=""

  windowTitle.innerText="Add an Excercise to the Database"

  var xhr= new XMLHttpRequest();
  xhr.open('GET', 'exAdd.html', true);
  xhr.onreadystatechange= function() {
    if (this.readyState!==4) return;
    if (this.status!==200) return; // or whatever error handling you want
    mainWindow.innerHTML= this.responseText;
  };
  xhr.send();


}



function editCookBookItem()
{
  //DO SQL QUERY TO FIGURE OUT IF ITEM IS FOOD OR EXCERCISE

  //IF FOOD
  console.log("edit cookbook window test")

  var mainWindow = document.getElementById("FoodAndExerciseWindow")
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

function logSomething(e)
{
  //alert("Change inner html");
  console.log(e);

  if(e === "logFood") {

    console.log("in log something - logFood");
    $("#logCard").load("foodLog.html");
    //window.location.href = 'foodLog.html';
  }
  else if(e === "logExercise") {

    $("#logCard").load("exLog.html");
    //window.location.href = "exLog.html";
  }
  calorieTotal()
  checkDietConflicts()


}



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

  //SQL QUERRY TO GET STUFF


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
