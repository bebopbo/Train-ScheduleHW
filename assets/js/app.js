
// Initialize Firebase
const config = {
  apiKey: "AIzaSyAxbnYp4gVcQCw2GWqN6qHWfprm4cnJY1I",
  authDomain: "train-schedule-b47d8.firebaseapp.com",
  databaseURL: "https://train-schedule-b47d8.firebaseio.com",
  projectId: "train-schedule-b47d8",
  storageBucket: "train-schedule-b47d8.appspot.com",
  messagingSenderId: "874619747359"
};
firebase.initializeApp(config);

const database = firebase.database();
let data;


// Pulls new data from Firebase on change
database.ref().on("value", function (snapshot) {

  data = snapshot.val();

  refresh();

});


// Submit Button
$("#addTrainButton").on('click', function () {

  // Collect values from the HTML Form
  const trainName = $("#nameInput").val().trim();
  const trainDest = $("#destinationInput").val().trim();
  const trainArrival = $("#firstArrivalInput").val().trim();
  const trainFreq = $("#frequencyInput").val().trim();

  // Check for military time
  if (trainArrival.length != 5 || trainArrival.indexOf(":") != 2) {
    alert("Please use Military Time! \n" + "Example: 01:00 or 13:00");
    return false;
  }

  var today = new Date();
  var thisMonth = today.getMonth() + 1;
  var thisDate = today.getDate();
  var thisYear = today.getFullYear();


  var dateString = "";
  var dateString = dateString.concat(thisMonth, "/", thisDate, "/", thisYear);


  var trainFirstArrival = dateString.concat(" ", trainArrival);


  database.ref().push({
    name: trainName,
    destination: trainDest,
    firstArrival: trainFirstArrival,
    frequency: trainFreq
  });

  // Clear form after submit
  $("#nameInput").val("");
  $("#destinationInput").val("");
  $("#firstArrivalInput").val("");
  $("#frequencyInput").val("");


  return false;
});



// Function to Update the HTML
function refresh() {

  // Clears Old Data 
  $('.table-body-row').empty();

  // Array of objects (for locations)
  var arrayOfObjects = [];

  // Array of time (for times)
  var arrayOfTimes = [];



  $.each(data, function (key, value) {


    // Collect variable 
    var trainName = value.name;
    var trainDest = value.destination;
    var trainFreq = value.frequency;
    var trainArrival = value.firstArrival;


    var trainNextDeparture;
    var trainMinutesAway;


    // Calculate values with Moment.js
    var changedDate = moment(new Date(trainArrival));

    // Calculate minutes away and first departure 
    var firstArrivalToNow = moment(changedDate).diff(moment(), "minutes") * (-1);

    trainMinutesAway = trainFreq - (firstArrivalToNow % trainFreq);

    // Next departure  = Current time + Minutes away
    var trainNextDepartureDate = moment().add(trainMinutesAway, 'minutes');


    // Re-Format Time to AM/PM
    trainNextDeparture = trainNextDepartureDate.format("hh:mm A");


    var newObject = {
      name: trainName,
      destination: trainDest,
      freq: trainFreq,
      nextDeparture: trainNextDeparture,
      minAway: trainMinutesAway
    };

    // Push the new Object to the array of Objects
    arrayOfObjects.push(newObject);

    // Push the time left until depature to the array of Times
    arrayOfTimes.push(trainMinutesAway);

  });


  // Sort the array of Time from smallest to largest
  arrayOfTimes.sort(function (a, b) { return a - b });

  // Remove any duplicate values from the array
  $.unique(arrayOfTimes)

  // Loop through all the time values and append the values to the HTML Table in order of departure time
  for (var i = 0; i < arrayOfTimes.length; i++) {

    // First Loop checks through all the times, second loop checks if any of the objects match that time
    for (var o = 0; o < arrayOfObjects.length; o++) {

      // The object's minutes to departue equals the next lowest value
      if (arrayOfObjects[o].minAway == arrayOfTimes[i]) {

        // Append the Object's elements to the HTML Table
        var newRow = $('<tr>');
        newRow.addClass("table-body-row");

        // Create New HTML data cells
        var trainNameAr = $('<td>');
        var destinationAr = $('<td>');
        var frequencyAr = $('<td>');
        var nextDepartureAr = $('<td>');
        var minutesAwayAr = $('<td>');

        // Add text to the HTML data cells
        trainNameAr.text(arrayOfObjects[o].name);
        destinationAr.text(arrayOfObjects[o].destination);
        frequencyAr.text(arrayOfObjects[o].freq);
        nextDepartureAr.text(arrayOfObjects[o].nextDeparture);
        minutesAwayAr.text(arrayOfObjects[o].minAway);

        // Append HTML data cells to the newRow
        newRow.append(trainNameAr);
        newRow.append(destinationAr);
        newRow.append(frequencyAr);
        newRow.append(nextDepartureAr);
        newRow.append(minutesAwayAr);

        // Append new Row to the HTML Table
        $('.table').append(newRow);

      }
    }
  }
}



// Update the Current Time every second
var timeStep = setInterval(currentTime, 1000);

function currentTime() {
  var timeNow = moment().format("hh:mm:ss A");
  $("#current-time").text(timeNow);

  // Refresh the Page every minute, on the minute
  var secondsNow = moment().format("ss");

  if (secondsNow == "00") {
    refresh();
  }

}