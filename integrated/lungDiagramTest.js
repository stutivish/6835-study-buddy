var cursor = new Cursor();
var cursorPosition; 

drawCursor();

//Leap Motion Sensor Variables
var counter = true; // default to true - when gesture is stopped, is set to false 
var isPointing = false; 

var hand;

//Speech Recognition Variables
var hoveringOverTrachea, hoveringOverBronchi, hoveringOverLeftLung, hoveringOverRightLung = false;
var tracheaCorrect, bronchiCorrect, leftLungCorrect, rightLungCorrect = false;

var numberOfCorrectGuesses = 0;
var totalNumberOfGuesses = 0;
var percentage = 0;
const numberOfAnswers = 4;


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

        if (indexFinger.extended && !middleFinger.extended && !ringFinger.extended && !thumb.extended) {
          isPointing = true; 
        } else {
          isPointing = false; 
        }

        // checks if user is pointing at right organ part 
        if (isPointing) {
          if (cursorPosition[0] > 595 && cursorPosition[0] < 615 && cursorPosition[1] > -390 && cursorPosition[1] < -310) {
            hoveringOverTrachea = true;
          }
          if (cursorPosition[0] > 587 && cursorPosition[0] < 637 && cursorPosition[1] > -250 && cursorPosition[1] < -215) {
            hoveringOverBronchi = true;
          }
          if (cursorPosition[0] > 450 && cursorPosition[0] < 575 && cursorPosition[1] > -350 && cursorPosition[1] < -50) {
            hoveringOverRightLung = true;
          }
          if (cursorPosition[0] > 640 && cursorPosition[0] < 750 && cursorPosition[1] > -335 && cursorPosition[1] < -30) {
            hoveringOverLeftLung = true;
          }
        }

          // checks swiping gestures
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
                            swipeRight(); 
                          }

                          if (type_swipe == ("swipe left")) {
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

  //Transition commands
  //Before user progresses to next page, grade them
    if (textInvolves(transcript, 'swipe left') || textInvolves(transcript, 'next')){

      if (totalNumberOfGuesses != 0) percentage = numberOfCorrectGuesses / numberOfAnswers * 100;

      if (percentage < 50){
        $('#diagram-instruction').html("Good job. You scored " + Math.round(percentage) + "%. Let's practice some more later.");
        document.getElementById("diagram-instruction").style.color = "#8f00ff"; 
        setTimeout(function() {
          swipeLeft();
        }, 5000);
      }
      else {
        $('#diagram-instruction').html("Great job! You scored " + Math.round(percentage) + "%.");
        document.getElementById("diagram-instruction").style.color = "#8f00ff"; 
        setTimeout(function() {
          swipeLeft();
        }, 5000);
      }
      
      processed = true;
    }

    else if (textInvolves(transcript, 'swipe right') || textInvolves(transcript, 'previous') || textInvolves(transcript, 'back')){
      swipeRight();
      processed = true;
    }

    else if (textInvolves(transcript, 'exit')){
      if (totalNumberOfGuesses != 0) percentage = numberOfCorrectGuesses / numberOfAnswers * 100;

      if (percentage < 50){
        $('#diagram-instruction').html("Good job. You scored " + Math.round(percentage) + "%. Let's practice some more later.");
        document.getElementById("diagram-instruction").style.color = "#8f00ff"; 
        setTimeout(function() {
          clickClosePage();
        }, 5000);
      }
      else {
        $('#diagram-instruction').html("Great job! You scored " + Math.round(percentage) + "%.");
        document.getElementById("diagram-instruction").style.color = "#8f00ff"; 
        setTimeout(function() {
          clickClosePage();        
        }, 5000);
      }
    } 


    else if (textInvolves(transcript,'calibrate')){
      clickCalibratePage();
      processed = true;
    }

    else if (textInvolves(transcript,'test') ){
      clickTestPage();
    }


    else if (textInvolves(transcript,'home')){
      clickHomePage();
    }


    //Answer checking    
    if (textInvolves(transcript,'trachea')){
      tracheaCorrect = processAnswer("trachea", hoveringOverTrachea);
      hoveringOverTrachea = false;
      if (tracheaCorrect){
        numberOfCorrectGuesses += 1;
        totalNumberOfGuesses += 1;
      }

      else {
        totalNumberOfGuesses += 1;
      }
    }

    if (textInvolves(transcript,'bronchi')){
      bronchiCorrect = processAnswer("bronchi", hoveringOverBronchi);
      hoveringOverBronchi = false;

      if (bronchiCorrect){
        numberOfCorrectGuesses += 1;
        totalNumberOfGuesses += 1;
      }

      else {
        totalNumberOfGuesses += 1;
      }
    }

    if (textInvolves(transcript,'left lung')){
      leftLungCorrect = processAnswer("left lung", hoveringOverLeftLung);
      hoveringOverLeftLung = false;
      if (leftLungCorrect){
        numberOfCorrectGuesses += 1;
        totalNumberOfGuesses += 1;
      }

      else {
        totalNumberOfGuesses += 1;
      }
    }

    if (textInvolves(transcript,'right lung')){
      rightLungCorrect = processAnswer("right lung", hoveringOverRightLung);
      hoveringOverRightLung = false;
      if (rightLungCorrect){
        numberOfCorrectGuesses += 1;
        totalNumberOfGuesses += 1;
      }

      else {
        totalNumberOfGuesses += 1;
      }
    }

    // else if (textInvolves(transcript,'lungs') || textInvolves(transcript,'long') || textInvolves(transcript,'lung')){
    //   voicesReady = true;
    //   generateSpeech("Please specify. Which side of the lungs?");
    //   reset(200000000000000); //delay added to prevent repetition of the speech command
    // }

    //If user gets everything correct, let them know so they can make progress.
    if (tracheaCorrect && bronchiCorrect && leftLungCorrect && rightLungCorrect){
      $('#diagram-instruction').html("Congratulations! You have a 4/4. Say 'Next' to move on to the next test");
      document.getElementById("diagram-instruction").style.color = "green"; 
    }

  return processed;
};



