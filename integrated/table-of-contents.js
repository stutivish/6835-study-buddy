var speaking = false;

var cursor = new Cursor();
var cursorPosition; 
var hoveringOverLung = false; 
var hoveringOverHeart = false; 
var isPointing = false; 
var counter = true; // default to true - when gesture is stopped, is set to false 


drawCursor();


var controller = Leap.loop( {enableGestures: true}, function(frame){
  if(frame.hands.length > 0) {
        hand = frame.hands[0]; 
        cursorPosition = hand.screenPosition();  
        cursor.setScreenPosition(cursorPosition);

        var pinky = hand.pinky; 
        var indexFinger = hand.indexFinger; 
        var middleFinger = hand.middleFinger; 
        var ringFinger = hand.ringFinger; 
        var thumb = hand.thumb; 

        // checks pointing gesture
        if (indexFinger.extended && !middleFinger.extended && !ringFinger.extended && !thumb.extended && !pinky.extended) {
          isPointing = true; 
        }

        // checks if user is pointing to correct spot on screen
        if (isPointing) {
          if ((cursorPosition[0] > 800 && cursorPosition[1] < 1020) && (cursorPosition[1] < -270 && cursorPosition[1] > -430)) {
            hoveringOverLung = true; 
          }

          if ((cursorPosition[0] > 800 && cursorPosition[1] < 1020) && (cursorPosition[1] < -25 && cursorPosition[1] > -200)) {
            hoveringOverHeart = true; 
          }

          if (hoveringOverLung) {
            setTimeout(function() {
              clickLungsPage(); 
            }, 500); 
          } else if (hoveringOverHeart) {
            setTimeout(function() {
              clickHeartPage(); 
            }, 500); 
          }
        }

        // detects swipe gestures
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


  //Transition Commands
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

    else if (textInvolves(transcript,'test') ){
      clickTestPage();
    }


    else if (textInvolves(transcript,'home')){
      clickHomePage();
    }

    else if ( textInvolves(transcript, 'help') ){
      clickHelpSpeechPage();
      processed = true;
    }

    else if (textInvolves(transcript,'lungs')){
      clickLungsPage();
    }

    else if (textInvolves(transcript,'heart')){
      clickHeartPage();
    }




  return processed;
};