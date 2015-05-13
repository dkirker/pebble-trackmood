var Moods = ["Terrible", "Bad", "OK", "Great", "Awesome"];
var Times = ["morning", "afternoon", "daytime", "evening", "night"];

Pebble.addEventListener("ready",
    function(e) {
        console.log("Javascript ready!");
    }
);

Pebble.addEventListener("appmessage",
  function(e) {
    console.log('Got message! ' + JSON.stringify(e.payload));
    if (e && e.payload) {
      var mood = e.payload.mood;
      // unnecessary?
      var time = e.payload.time;
      console.log("Mood is " + mood + ", time is " + time);
      pushMoodPin(mood, time);
    }
    else {
      console.log("No payload in message from watch!");  
    }
  }
);

function pushMoodPin(mood, time) {
  var id = new Date().getTime().toString();
  console.log("Mood is " + Moods[mood] + ", time is " + Times[time]);
  var pin = {
    "id": id,
    "time": new Date().toISOString(),
    "layout": {
      "type": "genericPin",
      "title": Moods[mood] + " mood",
      "subtitle": "in the " + Times[time],
      "body": "Can you think of why? What happened then? What made you feel that way?",
      "tinyIcon": "system://images/TIMELINE_CALENDAR_TINY"
    }
  };
  console.log("Sending pin: " + JSON.stringify(pin));
  insertUserPin(pin, function(result) {console.log('Pushed mood pin: ' + result);});
}

// unused?
function appMessageAck(e) {
  console.log("Message accepted by Pebble!");
}

function appMessageNack(e) {
  console.log("Message rejected by Pebble!");
}


/******************************* timeline lib *********************************/

// The timeline public URL root
var API_URL_ROOT = 'https://timeline-api.getpebble.com/';

/**
 * Send a request to the Pebble public web timeline API.
 * @param pin The JSON pin to insert. Must contain 'id' field.
 * @param type The type of request, either PUT or DELETE.
 * @param callback The callback to receive the responseText after the request has completed.
 */
function timelineRequest(pin, type, callback) {
  // User or shared?
  var url = API_URL_ROOT + 'v1/user/pins/' + pin.id;

  // Create XHR
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    console.log('timeline: response received: ' + this.responseText);
    callback(this.responseText);
  };
  xhr.open(type, url);

  // Get token
  Pebble.getTimelineToken(function(token) {
    // Add headers
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-User-Token', '' + token);

    // Send
    xhr.send(JSON.stringify(pin));
    console.log('timeline: request sent.');
  }, function(error) { console.log('timeline: error getting timeline token: ' + error); });
}

/**
 * Insert a pin into the timeline for this user.
 * @param pin The JSON pin to insert.
 * @param callback The callback to receive the responseText after the request has completed.
 */
function insertUserPin(pin, callback) {
  timelineRequest(pin, 'PUT', callback);
}

/**
 * Delete a pin from the timeline for this user.
 * @param pin The JSON pin to delete.
 * @param callback The callback to receive the responseText after the request has completed.
 */
function deleteUserPin(pin, callback) {
  timelineRequest(pin, 'DELETE', callback);
}

/***************************** end timeline lib *******************************/