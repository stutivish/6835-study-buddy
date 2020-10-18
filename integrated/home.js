//Leap Motion Sensor Variables
var counter = true; // default to true - when gesture is stopped, is set to false 
var hand;

//Speech Recognition Variables
var hoveringOverTrachea, hoveringOverBronchi, hoveringOverLeftLung, hoveringOverRightLung = false;


/*  Main Leap loop
	Implements logic for identifying different gestures frame by frame 
	Params: frame 
	Return: gesture type (type_swipe)
*/ 
var controller = Leap.loop( {enableGestures: true}, function(frame){
  if(frame.valid && frame.gestures.length > 0) {
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
                console.log(type_swipe); 
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

    else if (textInvolves(transcript, 'help')){
      clickHelpSpeechPage();
      processed = true;
    }

    else if (textInvolves(transcript,'test') ){
      clickTestPage();
    }


    else if (textInvolves(transcript,'home')){
      clickHomePage();
    }

    //Check for possible answers if user says a key word
    if (textInvolves(transcript,'trachea')){
      processAnswer("trachea", hoveringOverTrachea);
      hoveringOverTrachea = false;
    }

    if (textInvolves(transcript,'bronchi')){
      processAnswer("bronchi", hoveringOverBronchi);
      hoveringOverBronchi = false;
    }

    if (textInvolves(transcript,'left lung')){
      processAnswer("left lung", hoveringOverLeftLung);
      hoveringOverLeftLung = false;
    }

    if (textInvolves(transcript,'right lung')){
      processAnswer("right lung", hoveringOverRightLung);
      hoveringOverRightLung = false;
    }

  return processed;
};



