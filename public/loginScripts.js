//highlight rows in user table (login.html)
let lastSelectedRow = 0;
//will hold the userID of the selected user
let selectedUserID = 0;

$(document).ready(function()
{
  $("#delLogButton").click(function()
  {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', "/deleteUser", true);
    xhr.setRequestHeader("Content-type", "application/json");
    console.log("trying to delete user: " + selectedUserID);
    let params = {};
    params.userID = selectedUserID;

    xhr.onreadystatechange = function()
    {
      if (xhr.readyState === 4)
      {
          console.log("user should be deleted, good response from server");
          location.reload();
      }
    }

    xhr.send(JSON.stringify(params));
  });

});



$(".userTableRow").click(function()
{
  if(lastSelectedRow === 0){ //no rows yet selected
    //change the class of the <a> button so it will be selectable
    $("#selectUserBtn").removeClass("btn btn-outline-primary disabled");
    $("#selectUserBtn").addClass("btn btn-outline-primary");
  }
  //rows have been selected, remove highlighting from last selected row
  if(lastSelectedRow !== 0)
  {
    lastSelectedRow.style.backgroundColor="";
    lastSelectedRow.style.color="black";
    lastSelectedRow = this;
  }
  //row highlighting
  this.style.backgroundColor="#007bff";
  this.style.color="white";
  lastSelectedRow = this;
  selectedUserID = this.firstElementChild.textContent;
  console.log("selected userID: " + selectedUserID)
});

$('#selectUserBtn').click(function(event)
{
  event.preventDefault();
  window.location.href += 'interface?userID=' + selectedUserID;
})
