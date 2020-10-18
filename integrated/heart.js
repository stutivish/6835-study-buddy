var cursor = new Cursor();
var cursorPosition; 

drawCursor();

//Leap Motion Sensor Variables
// same gesture code as in lungs.js 
var counter = true; // default to true - when gesture is stopped, is set to false 
var canZoom = false;
var canRotate = false;  
var prevXpos = 0; 
var prevZpos = 0; 

var horizontalRotate = {}; 
var verticalRotate = {}; 
var zoomFactor = {}; 
var appWidth = 600; 
var appHeight = 400; 

var hand;
var freeze = false; 

//Speech Recognition Variables

var narratorListening = true;
var hoveringOverTrachea, hoveringOverBronchi, hoveringOverLeftLung, hoveringOverRightLung = false;
var speaking = false;

/*  Main Leap loop
	Implements logic for identifying different gestures frame by frame 
	Params: frame 
	Return: gesture type (type_swipe)
*/ 
var controller = Leap.loop( {enableGestures: true}, function(frame){


   if(frame.hands.length > 0)
    {
        hand = frame.hands[0]; 

        cursorPosition = hand.screenPosition();  

        cursor.setScreenPosition(cursorPosition);

        // gets the Leap dimensions of the interaction box (https://developer-archive.leapmotion.com/documentation/csharp/devguide/Leap_Coordinate_Mapping.html)
        var iBox = controller.frame().interactionBox; 

        // Get each indvidual fingers from the hand 
        var pinky = hand.pinky; 
        var indexFinger = hand.indexFinger; 
        var middleFinger = hand.middleFinger; 
        var ringFinger = hand.ringFinger; 
        var thumb = hand.thumb; 

        if (!freeze && indexFinger.extended && middleFinger.extended && ringFinger.extended && thumb.extended && pinky.extended) {
          canZoom = true; 
        } else {
          canZoom = false; 
        }

        if (canZoom) {
          var palmPosition = hand.palmPosition; // gets the palm position of user's hand at given point in time
          var zPos = palmPosition[2]; 
          if (Math.abs(prevZpos - zPos) > 0) {
            
            if (zPos > prevZpos) {              
              zoomFactor["deltaY"] = -1*(prevZpos-zPos); 
              controls.myHandleMouseWheel(zoomFactor); 
            } 

            else if (zPos < prevZpos) {
              zoomFactor["deltaY"] = -1*(prevZpos-zPos); 
              controls.myHandleMouseWheel(zoomFactor); 
            }
            prevZpos = zPos; 
          }
        }

        if (!freeze && hand.grabStrength > 0.6) {
          canRotate = true; 
        } else {
          canRotate = false; 
        }

        if (canRotate) {
          var palmPosition = hand.palmPosition; // gets the palm position of user's hand at given point in time

          var normalizedPoint = iBox.normalizePoint(palmPosition, true); // normalize palm position point 
          var xPos = normalizedPoint[0] * appWidth; // scale it according to organ window dimensions
          var yPos = (1 - normalizedPoint[1]) * appHeight; 

          if (Math.abs(prevXpos - xPos) > 0) { // have a threshold of 20 so that prints statements aren't bombarded in console - will take out later
            if (xPos > prevXpos) {
              horizontalRotate['clientX'] = xPos; // argument that Orbital Control takes in
              horizontalRotate['clientY'] = yPos; 
              controls.handleMoveRotate(horizontalRotate); 
            } else if (xPos < prevXpos) {
              horizontalRotate["clientX"] = xPos; 
              horizontalRotate['clientY'] = yPos; 
              controls.handleMoveRotate(horizontalRotate);
            }
            prevXpos = xPos; 
          }
        }


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
      clickTestTableOfContents();
    }

    else if (textInvolves(transcript,'home')){
      clickHomePage();
    }

    else if ( textInvolves(transcript, 'help') ){
      clickHelpSpeechPage();
      processed = true;
    }

    else if ( textInvolves(transcript, 'lung') || textInvolves(transcript, 'lungs') ){
      clickLungsPage();
      processed = true;
    }

    else if (textInvolves(transcript, 'exit') || textInvolves(transcript, 'end')){
      clickClosePage();
      processed = true;
    }

  return processed;
};



