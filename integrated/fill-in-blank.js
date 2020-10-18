var cursor = new Cursor();
var cursorPosition; 

drawCursor();

//Leap Motion Sensor Variables
var counter = true; // default to true - when gesture is stopped, is set to false 
var isPointing = false; 

var hand;

//Speech Recognition Variables
var hoveringOverOxygen, hoveringOverCO, hoveringOverTrachea = false;
var oxCorrect, coCorrect, traCorrect = false;

var showingHint = false;
var numCorrectGuesses = 0;
var totalNumberGuesses = 0;
var numAnswers = 3;

var percentage = 0;


/*  Main Leap loop
  Implements logic for identifying different gestures frame by frame 
  Params: frame 
*/ 
var controller = Leap.loop( {enableGestures: true}, function(frame){


   if(frame.hands.length > 0)
    {
        hand = frame.hands[0];

        cursorPosition = hand.screenPosition();  

        cursor.setScreenPosition(cursorPosition);

        // Get each indvidual fingers from the hand 
        var indexFinger = hand.indexFinger; 
        var middleFinger = hand.middleFinger; 
        var ringFinger = hand.ringFinger; 
        var thumb = hand.thumb; 

        // if only index Finger extended, then pointing gesture 
        if (indexFinger.extended && !middleFinger.extended && !ringFinger.extended && !thumb.extended) {
          isPointing = true; 
        } else {
          isPointing = false; 
        }

        //checking for pointing on the blank line
        if (isPointing) {
          if (cursorPosition[0] > 160 && cursorPosition[0] < 290 && cursorPosition[1] > -80 && cursorPosition[1] < -50) {
            hoveringOverOxygen = true;
          } else {
            hoveringOverOxygen = false; 
          }
          if (cursorPosition[0] > 460 && cursorPosition[0] < 600 && cursorPosition[1] > -70 && cursorPosition[1] < -10) {
            hoveringOverCO = true;
          } else {
            hoveringOverCO = false; 
          }
          if (cursorPosition[0] > 600 && cursorPosition[0] < 710 && cursorPosition[1] > -35 && cursorPosition[1] < 20) {
            hoveringOverTrachea = true;
          } else {
            hoveringOverTrachea = false; 
          }
     
        }


          // Detecting gesture swipes
          if (indexFinger.extended && middleFinger.extended && ringFinger.extended && thumb.extended) {
            if(frame.valid && frame.gestures.length > 0){
              frame.gestures.forEach(function(gesture){
                  switch (gesture.type){
                    case "swipe":
                        var type_swipe = ""; 
                        var isHorizontal = Math.abs(gesture.direction[0]) >= Math.abs(gesture.direction[1]); // if true, then primarily horizontal swipe
                        if (isHorizontal){
                          if (gesture.direction[0] >= 0) { // primarily swipe left
                            type_swipe = "swipe right"; 
                          } else {
                            type_swipe = "swipe left"; 
                          }
                        } else { // primarily vertical 
                          if (gesture.direction[1] >= 0) {
                            type_swipe = "swipe down"; 
                          } else {
                            type_swipe = "swipe up"; 
                          }
                        }
                        if (gesture.state == "stop" && counter==true) { // only register the swipe once the gesture has come to a stop & the counter is true (first stop registered)
                          if (type_swipe == ("swipe right")) {
                            console.log("swipe right"); 
                            swipeRight(); 
                          }

                          if (type_swipe == ("swipe left")) {
                            console.log("swipe left"); 
                            swipeLeft(); 
                          }
                          counter = false; // set counter to false, so that instantaneous stops won't return the same swipe gesture multiple times 
                          reset(1000); 
                          
                        }
                        break;
                  }
              });
            }
          }
    }

}).use('screenPosition', {scale: LEAPSCALE});

// processSpeech(transcript)
//  Is called anytime speech is recognized by the Web Speech API
// Input: 
//    transcript, a string of possibly multiple words that were recognized
// Output: 
//    processed, a boolean indicating whether the system reacted to the speech or not
var processSpeech = function(transcript) {
  // Helper function to detect if any commands appear in a string
  var userSaid = function(str, commands) {
    for (var i = 0; i < commands.length; i++) {
      if (str.indexOf(commands[i]) > -1)
        return true;
    }
    return false;
  };

  var processed = false;

  for (i=0; i<transcript.length; i++) {
    if (transcript[i] != " ") {
      transcript = transcript.substring(i, transcript.length); 
      break; 
    }
  }

  var spaceCount = (transcript.split(" ").length - 1)
  var firstword = "" ; 
  var secondword = "" ; 
   
  if (spaceCount > 1) {
    firstword = transcript.substring(0, transcript.indexOf(" ")); 
    var sub = transcript.substring(transcript.indexOf(" ")+1, transcript.length); 
    secondword = transcript.substring(transcript.indexOf(" ")+1, sub.substring(0, sub.indexOf(" "))); 
  }
  else if (spaceCount === 1) {
    firstword = transcript.substring(0, transcript.indexOf(" ")); 
    secondword = transcript.substring(transcript.indexOf(" "), transcript.length); 
  }
  else if (spaceCount == 0 && transcript.length > 1) {
    firstword = transcript; 
  }


    if (textInvolves(transcript, 'swipe left') || textInvolves(transcript, 'next')){
      swipeLeft();
      processed = true;
    }

    else if (textInvolves(transcript, 'swipe right') || textInvolves(transcript, 'previous') || textInvolves(transcript, 'back')){
      swipeRight();
      processed = true;
    }


    else if (textInvolves(transcript,'calibrate')){
      clickCalibrateIntroPage();
      processed = true;
    }

    else if (textInvolves(transcript,'home')){
      clickHomePage();
    }


    //hinting when user says I don't know
    if (textInvolves(transcript,"i don't know") || textInvolves(transcript,"help")){
      if (hoveringOverOxygen){
          document.getElementById("q1-clue").style.display = "block";
          showingHint = true;
          setTimeout(function() {
            document.getElementById("q1-clue").style.display = "none";
            hoveringOverOxygen = false;
          }, 8000);
          
      }

      if (hoveringOverCO){
          document.getElementById("q1-clue").style.display = "block";
          showingHint = true;
          setTimeout(function() {
            document.getElementById("q1-clue").style.display = "none";
            showingHint = false;
            hoveringOverCO = false;
          }, 8000);
          
          
      }

      if (hoveringOverTrachea){
        document.getElementById("q2-clue").style.display = "block";
          showingHint = true;
          setTimeout(function() {
            document.getElementById("q2-clue").style.display = "none";
            showingHint = false;
            hoveringOverTrachea = false;
          }, 8000);
        
      }

      if (!hoveringOverOxygen && !hoveringOverCO && !hoveringOverTrachea &!showingHint){
        document.getElementById("warning-message").style.visibility = "block";
        document.getElementById("warning-message").style.color = "red";
        setTimeout(function() {
            document.getElementById("warning-message").style.visibility = "none";
          }, 8000);
      }
    }
    //end of hinting
    
    //Checking if user hovers over part and makes an utterance
    if (hoveringOverOxygen){
      if (transcript != "") { 
          if (textInvolves(transcript,'oxygen')) {
          document.getElementById("q1-resp1").innerHTML = "<u>oxygen</u>";
          document.getElementById("q1-resp1").style.color = "green"; 
          oxCorrect = true;
          numCorrectGuesses += 1;
          totalNumberGuesses += 1;

        } else {
          document.getElementById("q1-resp1").innerHTML = "<u>" + firstword + secondword + "</u>";
          document.getElementById("q1-resp1").style.color = "red"; 
          totalNumberGuesses += 1;
        }
      }
      
      hoveringOverOxygen = false;
    } 

    if (hoveringOverCO){

      if (transcript != "") {
        if (textInvolves(transcript,'carbon dioxide') || textInvolves(transcript,'CO2')) {
          document.getElementById("q1-resp2").innerHTML = "<u>carbon dioxide</u>";
          document.getElementById("q1-resp2").style.color = "green"; 
          coCorrect = true;
          numCorrectGuesses += 1;
          totalNumberGuesses += 1;

        } else {
          document.getElementById("q1-resp2").innerHTML = "<u>" + firstword + secondword + "</u>";
          document.getElementById("q1-resp2").style.color = "red";
          totalNumberGuesses += 1; 
        }
      }

      hoveringOverCO = false;
    }

    if (hoveringOverTrachea){
      if (transcript != "") {
        if (textInvolves(transcript,'trachea')) {
          document.getElementById("q2-resp1").innerHTML = "<u>trachea</u>"; 
          document.getElementById("q2-resp1").style.color = "green"; 
          traCorrect = true;
          numCorrectGuesses += 1;
          totalNumberGuesses += 1;

        } else {
          document.getElementById("q2-resp1").innerHTML = "<u>" + firstword + secondword + "</u>";
          document.getElementById("q2-resp1").style.color = "red"; 
          totalNumberGuesses += 1;
        }
      }

      hoveringOverTrachea = false;
    }

    //Compute their score when user tries to leave
    else if (textInvolves(transcript, 'exit') || textInvolves(transcript, 'end') || textInvolves(transcript, 'next')){

      if (totalNumberGuesses != 0) percentage = numCorrectGuesses / numAnswers * 100;

      if (percentage < 50){
        $('#fill-instruction').html("Good job. You scored " + Math.round(percentage) + "%. Let's practice some more later.");
        document.getElementById("fill-instruction").style.color =  "#8f00ff"; 
        setTimeout(function() {
          clickClosePage();
        }, 5000);
      }
      else {
        $('#fill-instruction').html("Great job! You scored " + Math.round(percentage)  + "%.");
        document.getElementById("fill-instruction").style.color =  "#8f00ff"; 
        setTimeout(function() {
          clickClosePage();
        }, 5000);
      }
      processed = true;
      
    }

    //When user gets everything correct, let them know
    if (oxCorrect && coCorrect && traCorrect){
      $('#fill-instruction').html("Congratulations! You have successfully completed the test! Say 'Next' to move on.");
      document.getElementById("fill-instruction").style.color =  "#8f00ff"; 
    }

  return processed;
};