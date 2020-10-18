var cursor = new Cursor();
var cursorPosition; 

drawCursor();

//Leap Motion Sensor Variables
var counter = true; // default to true - when gesture is stopped, is set to false 
var canZoom = false; 
var canRotate = false;  
var prevXpos = 0; // keeps track of previous x position that the hand was at
var prevZpos = 0; // keeps track of previous z position that the hand was at

var horizontalRotate = {}; // parameter for Orbital controls rotation function
var zoomFactor = {}; // parameter for Orbital controls zoom function
var appWidth = 600; 
var appHeight = 400; 

var hand;
var freeze = false; // allows model to disregard gesture input

var range = 50;

//Speech Recognition Variables
var hoveringOverTrachea, hoveringOverBronchi, hoveringOverLeftLung, hoveringOverRightLung = false;

var controls, camera;

camera = new THREE.PerspectiveCamera(75, 2, 5, 1000);
camera.position.set( 50, -150, -80 );

controls = new THREE.OrbitControls( camera );
controls.target.set( 50, 45, 0 );
controls.update();



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

        // if the user is free to rotate + makes a flat palm gesture
        if (!freeze && indexFinger.extended && middleFinger.extended && ringFinger.extended && thumb.extended && pinky.extended) {
          canZoom = true; 
        } else {
          canZoom = false; 
        }

        if (canZoom) {
          var palmPosition = hand.palmPosition; // gets the palm position of user's hand at given point in time
          var zPos = palmPosition[2]; 
          if (Math.abs(prevZpos - zPos) > 0) {
            
            if (zPos > prevZpos) { // if zooming out 

              if (range > 1 && range < 101){
                range -= 1;
                document.getElementById("myRange").value = range;
                console.log(range);
              }
              
              zoomFactor["deltaY"] = -1*(prevZpos-zPos); // paramater for orbit control function 
              controls.myHandleMouseWheel(zoomFactor); // orbit controls zooming function
            } 


            else if (zPos < prevZpos) { // if zooming in 

              if (range < 100 && range > 0){
                range += 1;
                document.getElementById("myRange").value = range;
                console.log(range);
              }
              zoomFactor["deltaY"] = -1*(prevZpos-zPos); 
              controls.myHandleMouseWheel(zoomFactor); 
            }
            prevZpos = zPos; 
          }
        }

        // if the user is free to zoom and makes a fist-like gesture
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

          if (Math.abs(prevXpos - xPos) > 0) { 
            if (xPos > prevXpos) {
              // console.log("rotate CCW"); // moving hands to the right
              horizontalRotate['clientX'] = xPos; // argument that Orbital Control takes in
              horizontalRotate['clientY'] = yPos; 
              controls.handleMoveRotate(horizontalRotate); 
            } else if (xPos < prevXpos) {
              // console.log("rotate CW"); // moving hands to the left 
              horizontalRotate["clientX"] = xPos; 
              horizontalRotate['clientY'] = yPos; 
              controls.handleMoveRotate(horizontalRotate);
            }
            prevXpos = xPos; 
          }
        }

        // detects swiping gestures
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


  //When user says freeze, the model is held in place on the screen, so that they can move their hands freely
    if (textInvolves(transcript, 'freeze')){
      freeze = true; 
      processed = true;
    }

    if (textInvolves(transcript, 'unfreeze')){
      freeze = false; 
      processed = true;
    }

    //Transition Commands
    if (textInvolves(transcript, 'swipe left') || textInvolves(transcript, 'next') || textInvolves(transcript, 'heart')){
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

    //Content exploration commands
    if (textInvolves(transcript,'tell me about the lungs')){
      document.getElementById("speaker-img").style.visibility = "visible";
      readLungs();
      processed = true;
    }

    if (textInvolves(transcript,'tell me about the trachea') || textInvolves(transcript,'what is trachea')){
      readTrachea();
      document.getElementById("speaker-img").style.visibility = "visible";
      processed = true;
    }

    else if (textInvolves(transcript,'tell me about the bronchioles') || textInvolves(transcript,'what are bronchioles')){
      document.getElementById("speaker-img").style.visibility = "visible";
      readBronchioles();
    }

    else if (textInvolves(transcript,'tell me about the bronchi') || textInvolves(transcript,'what is bronchi')){
      document.getElementById("speaker-img").style.visibility = "visible";
      readBronchi();
    }

    else if (textInvolves(transcript,'tell me about the alveoli') || textInvolves(transcript,'what are alveoli')){
      document.getElementById("speaker-img").style.visibility = "visible";
     readAlveoli();
   }

    else if (textInvolves(transcript,'tell me about the pleura') || textInvolves(transcript,'what is pleura')){
      document.getElementById("speaker-img").style.visibility = "visible";
    readPleura();
   }

  return processed;
};
