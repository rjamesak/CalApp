/****************
 * Russell James
 * Lydia Brynmoor
 * CS340 Winter 2020
 * Project
 *****************/
var express = require('express');
var mysql = require('./dbcon.js');//connection info
var bodyParser = require('body-parser');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var request = require('request'); //for http requests

var bodyParser = require('body-parser');

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3000);
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.json());

//***GLOBAL VARIABLES

var currentUser;

//***END GLOBAL VARIABLES

//***ROUTE HANDLING CODE AT BELOW HERE



//re-route to the add user form
app.get('/addUser', function(req,res,next)
{
  //request to add a user to the database
  //this will simply open the form
  res.render('userAdd');
})



//RENDER ADD USER PAGE
app.get("/addUserPage", function(req, res, next)
{
  console.log("refering to userAdd page for new user")
  res.render('userAdd')
})

app.get("/foodLog", function(req, res, next)
{
  res.render('foodLog');
})



app.post("/getCurrentUser", function(req,res,next)
{
  console.log("recieved request for current user from client: " + currentUser)
  res.send(currentUser)
});



app.post("/removeFromLog", function(req, res, next)
{
  console.log("trying to log item : " + req.body.id + " " + req.body.type + " for userID=" + currentUser)

  if (req.body.type=="Food")
  {
    mysql.pool.query('DELETE FROM FoodLog where foodLogID=? AND userID=?',
    [req.body.id, currentUser], function(err, result)
    {
      if (err)
      {
        console.log('error: ' + err);
        console.log("failed to delete foodlog entry from DB");
        next(err);
      }
      console.log("should've deleted food from log");
      res.sendStatus(res.statusCode);
    });
  }
  else
  {
    mysql.pool.query('DELETE FROM ExerciseLog where exerciseLogID=? AND userID=?',
    [req.body.id, currentUser], function(err, result)
    {
      if (err)
      {
        console.log('error: ' + err);
        console.log("failed to delete exlog entry from DB");
        next(err);
      }
      console.log("should've deleted exercise from log");
      res.sendStatus(res.statusCode);
    });
  }

});



app.post("/removeFromCookBook", function(req, res, next)
{
  console.log("trying to remove cookbook item : " + req.body.type + " id: " + req.body.id + " for userID=" + currentUser)

  if (req.body.type=="Food")
  {
    console.log("using remove food syntax");

    mysql.pool.query('DELETE FROM Foods where foodID=?',
    [req.body.id], function(err, result)
    {
      if (err)
      {
        console.log('error: ' + err);
        console.log("failed to delete entry from Foods");
        next(err);
      }
      console.log("should've deleted food from foods");
      res.sendStatus(res.statusCode);
    });
  }
  else
  {
    console.log("using remove exercise syntax");

    mysql.pool.query('DELETE FROM Exercises where exerciseID=?',
    [req.body.id], function(err, result)
    {
      if (err)
      {
        console.log('error: ' + err);
        console.log("failed to delete entry from Excercises");
        next(err);
      }
      console.log("should've deleted food from Excercises");
      res.sendStatus(res.statusCode);
    });
  }
});

app.post('/deleteUser', function (req, res, next)
{
  console.log("req to delete user:");
  console.log("req");
  console.log(req.body.userID);
  var query = "DELETE FROM Users WHERE userID = ?;";
  var inserts = [req.body.userID];
  mysql.pool.query(query, inserts, function(err, result)
  {
    if(err)
    {
      next(err);
      return;
    }
    res.sendStatus(res.statusCode);
  })
})



//default to the login page and display users
app.get('/', function(req, res, next)
{

  var context = {};
  mysql.pool.query('SELECT userID, firstName, lastName, email, DATE_FORMAT(birthDate, \'%m-%d-%Y\') AS birthDate FROM Users', function(err, rows, fields) {
    if(err)
    {
      console.log('error: ' + err)
      next(err);
      return;
    }
    context.people = rows;
    console.log(context.people);
    res.render('login', context);
  });
})



//ADD USER TO DATABASE
app.post('/addUser', function(req, res, next)
{
  //add row request received
  console.log('in add user section of server. req.body.action: ' + req.body.action);
  mysql.pool.query('INSERT INTO Users (firstName, lastName, email, birthDate)' +
  'VALUES (?, ?, ?, ?)', [req.body.firstName, req.body.lastName, req.body.email, req.body.birthDate], function(err, result) {
    if (err)
    {
      console.log('error: ' + err);
      next(err);
      return;
    }
    res.send(res.statusCode);
  });

});

//ADD FOOD
app.post('/addFood', function(req, res, next)
{
  console.log("req to add food");
  var query = "INSERT INTO Foods (name, servingSize, servingSizeUnits, calories, specialDietID) VALUES (?, ?, ?, ?, ?)";
  var inserts = [req.body.name, req.body.servingSize, req.body.servingSizeUnits, req.body.calories, req.body.specialDietID];
  mysql.pool.query(query, inserts, function(err, result)
  {
    if (err)
    {
      console.log('error adding food: ' + err);
      next(err);
      return;
    }
    res.send(res.statusCode);
  });
});

//ADD EXERCISE
app.post('/addExercise', function(req, res, next)
{
  console.log("req to add exercise");
  var query = "INSERT INTO Exercises (name, durationMinutes, calories) VALUES (?, ?, ?);";
  var inserts = [req.body.name, req.body.duration, req.body.calories];
  mysql.pool.query(query, inserts, function (err, result)
  {
    if(err)
    {
      console.log("error adding exercise: " + err);
      next(err);
      return;
    }
    res.send(res.statusCode);
  });
});

//EDIT EXERCISE
app.post('/editExercise', function(req, res, next)
{
  console.log("req to edit exercise");
  var query = "UPDATE Exercises SET name = ?, durationMinutes = ?, calories = ? WHERE exerciseID = ?;";
  var inserts = [req.body.name, req.body.duration, req.body.calories, req.body.exerciseID];
  mysql.pool.query(query, inserts, function (err, result)
  {
    if(err)
    {
      console.log("error updating exercise");
      next(err);
      return;
    }
    res.send(res.statusCode);
  });
});

//EDIT/UPDATE Foods
app.post('/editFoods', function(req, res, next)
{
  console.log("req to edit Foods");
  var query = "UPDATE Foods SET name = ?, servingSize = ?, servingSizeUnits = ?, calories = ?, specialDietID = ? WHERE foodID = ?;";
  var inserts = [req.body.name, req.body.servingSize, req.body.servingSizeUnits, req.body.calories, req.body.specialDietID, req.body.foodID];
  mysql.pool.query(query, inserts, function(err, result)
  {
    if(err)
    {
      console.log("error updating foods");
      next(err);
      return;
    }
    //console.log("result from food Edit");
    //console.log(result);
    res.sendStatus(res.statusCode);
  })
})

//Get food IDs
app.post('/getFoodIDs', function(req, res, next)
{
  mysql.pool.query("SELECT foodID from Foods ORDER BY foodID;", function(err, rows, fields)
  {
    if(err)
    {
      console.log("error in getFoodIDs: " + err);
      next(err);
      return;
    }
    res.send(rows);
  })
});

//Add to the FoodLog;
app.post('/addFoodLog', function(req, res, next)
{
  console.log("req to add food Log: ");
  var foodObject = new Object()
  foodObject.id = req.body.id;
  foodObject.date = req.body.date
  foodObject.meal = req.body.meal
  foodObject.servings = req.body.servings
  foodObject.foodName = req.body.name
  console.log("got this food data: " + JSON.stringify(foodObject))

  var query = "INSERT INTO FoodLog (userID, foodID, date, meal, servings, calories) (SELECT ? as userID, ? as foodID, ? as date, ? as meal, ? as servings, calories * ? as calories FROM Foods WHERE foodID = ?);";
  var inserts = [currentUser, foodObject.id, foodObject.date, foodObject.meal, foodObject.servings, foodObject.servings, foodObject.id];
  mysql.pool.query(query, inserts, function(err, result)
  {
    if(err)
    {
      console.log("error adding to foodLog");
      next (err);
      return;
    }
    res.send(res.statusCode);
  });
});

//Add to Exercise Log
app.post('/logExData', function(req, res, next)
{
  console.log("req to add Ex Log: ");
  var exObject = new Object()

  exObject.id = req.body.name;
  exObject.date = req.body.date
  exObject.duration = req.body.duration

  console.log("got this excercise data: " + JSON.stringify(exObject))

  var query = "INSERT INTO ExerciseLog (userID, exerciseID, date, durationMinutes, calories) (SELECT ? as userID, ? as exerciseID, ? as date, ? as durationMinutes, calories * (? / durationMinutes) as calories FROM Exercises WHERE exerciseID = ?);";
  var inserts = [currentUser, exObject.id, exObject.date, exObject.duration, exObject.duration, exObject.id];
  mysql.pool.query(query, inserts, function(err, result)
  {
    if(err)
    {
      console.log("error adding to ExLog");
      next(err);
      return;
    }
    res.send(res.statusCode);
  });
});


//Get the exercise IDs
app.post('/getExIDs', function (req, res, next)
{
  mysql.pool.query("SELECT exerciseID from Exercises ORDER BY exerciseID;", function(err, rows, fields)
  {
    if(err)
    {
      console.log("error in getExIDs");
      next(err);
      return;
    }
    console.log("sending exercise IDs to frontend");
    res.send(rows);
  })
})

//GET request for interface page
//userID in req.query.userID
app.get('/interface', function(req, res, next)
{
  let context = {};
  var callbackCount = 0;
  getUser(req, res, mysql, context, complete);
  getActivityLog(req, res, mysql, context, complete);
  getFoodsAndExercises(res, mysql, context, complete);

  function complete()
  {
    callbackCount++;
    if(callbackCount >= 3)
    {
      currentUser=req.query.userID  //added this global variable so I can use it in front/back comms.
      res.render('interface', context);
    }
  }
});
















//Render food log form
app.get('/foodLogForm', function(req, res, next)
{
  let context = {};
  var callbackCount = 0;
  mysql.pool.query("SELECT foodID, name FROM Foods ORDER BY name;", function(err, rows, fields)
  {
    if(err)
    {
      console.log("error in logFoodData: " + err);
      next(err);
      return;
    }
    context.foods = rows;
    res.render('foodLog', context);
  });

});


//Render exercise log form
app.get('/exLogForm', function(req, res, next)
{
  let context = {};
  mysql.pool.query("SELECT exerciseID, name FROM Exercises ORDER BY name;", function(err, rows, fields)
  {
    if(err)
    {
      console.log("error in exLogForm: " + err);
      next(err);
      return;
    }
    context.exercises = rows;
    res.render('exLog', context);
  });
});












//Route for SEARCH
//needs req.query.searchName and req.query.userID
//this is basically a copy of the get '/interface' but instead
//of getting all foods and exercises, it calls the searchFoods...
//function to limit by a search parameter
app.get('/search', function(req, res, next)
{
  let context = {};
  var callbackCount = 0;
  getUser(req, res, mysql, context, complete);
  getActivityLog(req, res, mysql, context, complete);
  searchFoodsAndExercises(req, res, mysql, context, complete);

  function complete()
  {
    callbackCount++;
    if(callbackCount >= 3)
    {
      res.render('interface', context);
    }
  }
});



app.post("/recordWeight", function(req, res, next)
{
  console.log("userid: "+ currentUser +" weight recieved by backend: " + req.body.date + " " + req.body.weight)

  mysql.pool.query('INSERT INTO WeightLog (weight, date, userID)' + 'VALUES (?, ?, ?)',
  [req.body.weight, req.body.date, currentUser], function(err, result)
  {
    if (err)
    {
      console.log('error: ' + err);
      console.log("failed to send weight to DB");
      next(err);
      return;
    }
    res.sendStatus(res.statusCode);
  });

});



app.post("/deleteWeight", function(req, res, next)
{
  console.log("trying to delete weight from: " + req.body.date + " at: " + req.body.weight + " for userID=" + currentUser)
  var sqlFormatDate = req.body.date;
  sqlFormatDate = sqlFormatDate.replace(/(\d\d)\/(\d\d)\/(\d{4})/, "$3-$1-$2")

  console.log("\nconverted date: " + sqlFormatDate)

  mysql.pool.query('DELETE FROM WeightLog where date=? AND weight=? AND userID=?',
  [sqlFormatDate, req.body.weight, currentUser], function(err, result)
  {
    if (err)
    {
      console.log('error: ' + err);
      console.log("failed to delete weight from DB");
      next(err);
      return;
    }
    res.sendStatus(res.statusCode);
  });

});



app.get('/grabDailyCalories', function(req,res,next)
{
  console.log("server got request for todays calories")
  var query = "SELECT IFNULL(SUM(calories), 0) as totalDailyCalories FROM ( SELECT SUM(calories) as calories  FROM FoodLog WHERE userID = ? AND date = CURDATE() UNION SELECT SUM(calories) as calories  FROM ExerciseLog WHERE userID = ? AND date = CURDATE() ) combinedSums;";
  var inserts = [currentUser, currentUser];
  mysql.pool.query(query, inserts, function(err, result, fields)
  {
    if(err)
    {
      console.log("error in getTodaysCalories");
      console.log(err);
      res.render('500');
    }
    else if(result.length)
    {
      console.log("getTodaysCalories result: ");
      console.log(result[0]);

      res.send(JSON.stringify(result[0]))
    }
  });
})



app.get('/grabWeightData', function(req, res, next)
{
  var query = "SELECT DATE_FORMAT(date, '%m/%d/%Y') as date, weight FROM WeightLog WHERE userID = ? ORDER BY date;";
  var inserts = currentUser;
  var callbackCount=0;
  weightHistory=0

  console.log("stored user value: " + currentUser);

  mysql.pool.query(query, inserts, function(err, result, fields)
  {
    if(err)
    {
      console.log("error in getWeight");
      console.log(err);
      res.render('500');
    }
    else if(result.length)
    {
      console.log("getWeight results: ");
      //console.log(result);
      weightHistory=result

      complete();
    }
    else
    {
      console.log("no weight history");
      complete();
    }
  });


  function complete()
  {
    callbackCount++;
    if(callbackCount >= 1)
    {
      console.log(weightHistory)
      res.send(JSON.stringify(weightHistory))
    }
  }

});

app.get('/foodAddForm', function (req, res, next)
{
  let context = {};
  context.userID = req.query.userID;
  res.render('foodAdd.handlebars', context);
})

app.get('/exAddForm', function(req, res, next)
{
  let context = {};
  context.userID = req.query.userID;
  res.render('exAdd', context);
})

//Edit Foods
app.get('/editFoodAddForm', function(req, res, next)
{
  let context = {};
  context.userID = currentUser;
  var query = "SELECT name, servingSize, servingSizeUnits, calories, specialDietID FROM Foods WHERE foodID = ?;";
  var inserts = [req.query.id];
  mysql.pool.query(query, inserts, function(err, result, fields)
  {
    if(err)
    {
      console.log("error in editFoodForm");
      next(err);
      return;
    }
    else if(result.length)
    {
      console.log(result);
      context.name = result[0].name;
      context.servingSize = result[0].servingSize;
      context.servingSizeUnits = result[0].servingSizeUnits;
      context.calories = result[0].calories;
      context.specialDietID = result[0].specialDietID;
      console.log("context obj:");
      console.log(context);

      res.render('foodAdd', context);
    }
    else
    {
      context.noResultReturned = "data not available to update";
      res.render('foodAdd', context);
    }
  });

});

//Edit Exercises
app.get('/editExAddForm', function(req, res, next)
{
  let context = {};
  context.userID = currentUser;
  var query = "SELECT name, durationMinutes, calories FROM Exercises WHERE exerciseID = ?;";
  var inserts = [req.query.id];
  mysql.pool.query(query, inserts, function(err, result, fields)
  {
    if(err)
    {
      console.log("error in editExForm " + err);
      next(err);
      return;
    }
    else if(result.length)
    {
      console.log(result);
      context.name = result[0].name;
      context.duration = result[0].durationMinutes;
      context.calories = result[0].calories;
      res.render('exAdd', context);
    }
    else
    {
      context.noResultReturned = "data not available to update";
      res.render('exAdd', context);
    }
  })
})


//***END ROUTE HANDLING CODE












//UTILLITY FUNCTIONS BELOW vvv



//GET user function.
function getUser(req, res, mysql, context, complete) {
  var query = "SELECT firstName FROM Users WHERE userID = ?";
  var inserts = [req.query.userID];
  context.userID = req.query.userID;
  mysql.pool.query(query, inserts, function(err, result, fields) {
    if(err) {
      res.write(JSON.stringify(err));
      res.end();
    }
    if(result.length) {
      context.user = result[0];
      complete();
    }
    else {
      res.render('500');
    }
  });
}



//Get Activity Log
//selects from FoodLog and ExerciseLog table.
function getActivityLog(req, res, mysql, context, complete)
{
  var query = "SELECT fl.foodLogID as logID, DATE_FORMAT(fl.date, '%m/%d/%Y') as date, 'Food' AS class, 'NA' AS duration, fl.servings, fl.meal, fl.calories, f.name FROM FoodLog fl JOIN Foods f ON fl.foodID = f.foodID WHERE userID = ? UNION SELECT el.exerciseLogID as logID, DATE_FORMAT(el.date, '%m/%d/%Y') as date, 'Exercise' as class, el.durationMinutes + 'Minutes' as duration, 'NA' as servings, 'NA' as meal, el.calories, e.name FROM ExerciseLog el JOIN Exercises e ON el.exerciseID = e.exerciseID WHERE userID = ? ORDER BY date DESC, name;";
  var inserts = [req.query.userID, req.query.userID];
  mysql.pool.query(query, inserts, function(err, result, fields) {
    if(err) {
      console.log("error in getActivityLog");
      console.log(err);
      //res.write(JSON.stringify(err));
      res.render('500');
    }
    else if (result.length) {
      console.log("actLog result: ");
      console.log(result);
      context.logItems = result;
      complete();
    }
    else {
      context.noActivityData = "No Log Data";
      complete();
    }
  });
}



//Get Foods and Exercises
//Gets all foods and exercises in the tables
function getFoodsAndExercises(res, mysql, context, complete) {
  var query = "SELECT name, servingSize as servingDuration, servingSizeUnits as units, calories, specialDietID, 'Food' as class, foodID as ID FROM Foods UNION SELECT name, durationMinutes as servingDuration, 'Minutes' as units, calories, NULL as specialDietID, 'Exercise' as class, exerciseID as ID FROM Exercises ORDER BY name;";
  mysql.pool.query(query, function(err, result, fields) {
    if(err) {
      console.log("error in getFoods...");
      console.log(err);
      res.render('500');
    }
    else if(result.length) {
      //console.log("getFoods result: ");
      //console.log(result);
      context.foodsAndExercises = result;
      complete();
    }
    else {
      context.noFoodsAndExercises = "No Food or Exercise Data";
      complete();
    }
  });
}



//SEARCH Foods and Exercises
//return food and exercise rows that match search criteria
function searchFoodsAndExercises(req, res, mysql, context, complete)
{
  var query = "SELECT name, servingSize as servingDuration, servingSizeUnits as units, calories, specialDietID, 'Food' as class, foodID as ID FROM Foods WHERE name LIKE ? UNION SELECT name, durationMinutes as servingDuration, 'Minutes' as units, calories, NULL as specialDietID, 'Exercise' as class, exerciseID as ID FROM Exercises WHERE name LIKE ? ORDER BY name;";
  var inserts = ['%' + req.query.searchName + '%', '%' + req.query.searchName + '%'];
  console.log("in search fn: ");
  console.log(req.query.searchName);
  mysql.pool.query(query, inserts, function(err, result, fields)
  {
    if(err)
    {
      console.log("error in searchFoods...");
      console.log(err);
      res.render('500');
    }
    else if(result.length)
    {
      console.log("search results: ");
      console.log(result);
      context.foodsAndExercises = result;
      complete();
    }
    else
    {
      context.noFoodsAndExercises = "No Search Results";
      complete();
    }
  });
}



//*** END UTILLITY FUNCTIONS











app.use(function(req,res)
{
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next)
{
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function()
{
  console.log('Express started on port:' + app.get('port') + '; press Ctrl-C to terminate.');
});
