var serverURL = new URL(window.location.href).origin;


$('#addUserBtn').click(function(e)
{
    var emptyflag=0

    console.log("in addUser click function");
    e.preventDefault();
    let firstName = $('#firstName').val();
    let lastName = $('#lastName').val();
    let birthDate = $('#birthDate').val();
    let email = $('#email').val();
    console.log(firstName + lastName + birthDate + email);
    let params = {'action':'addUser', 'firstName':firstName, 'lastName':lastName, 'birthDate':birthDate, 'email':email};

    var trimmedFirstname = firstName.trim()
    var trimmedLastname = lastName.trim()
    var trimmedEmail = email.trim()

    if (trimmedFirstname.length==0 || trimmedLastname.length==0 || trimmedEmail.length==0)
    {
      console.log("found empty fields")
      emptyflag=1
    }

    if (emptyflag)
    {
      console.log("error, didn't submit because one or more fields are blank")
    }
    else
    {
      let req = new XMLHttpRequest();
      console.log(serverURL + "/addUser");
      req.open("POST", serverURL + '/addUser', true);
      req.setRequestHeader("Content-type", "application/json");

      //add 'load' event listener for async
      req.addEventListener("load", function()
      {
          if(req.status >= 200 && req.status < 400)
          {
              //go back to login page
              window.location.href = serverURL;
          }
          else {alert("server response error")};
      })
      req.send(JSON.stringify(params));
      //prevent page refresh
      //event.preventDefault();
    }
});
