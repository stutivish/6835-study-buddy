// SPEECH SYNTHESIS SETUP
var voicesReady = false;
window.speechSynthesis.onvoiceschanged = function() {
  voicesReady = true;
  // Uncomment to see a list of voices
  // console.log("Choose a voice:\n" + window.speechSynthesis.getVoices().map(function(v,i) { return i + ": " + v.name; }).join("\n"));
};



var generateSpeech = function(message, callback) {
  if (voicesReady) {
    var msg = new SpeechSynthesisUtterance();
    msg.voice = window.speechSynthesis.getVoices()[17];
    msg.text = message;
    msg.rate = 0.2;

    if (typeof callback !== "undefined") {
      msg.onend = callback;
    }
    speechSynthesis.speak(msg);
    voicesReady = false; //need to do this to break repetitive loop
  }
};



/*  Defines a reset function 
  Resets counter variable every second to true in order to prevent multiple instances of swipe (direction) for the same swipe gesture 
  Params: None
  Return: None
*/
function reset(duration){
    setTimeout(function(){ 
        counter = true; // reset to true 
    }, duration);
}


// function that allows user to move to the next page 
function swipeLeft(destinationState) {

  if ( isHomePage() ){
    clickHelpSpeechPage();
  }

  else if (isHelpSpeechPage()){
    clickHelpGesturePage();
  } 

  else if (isHelpGesturePage()){
    clickCalibrateIntroPage();
  }

  else if ( isCalibrateIntroPage() ){
    clickCalibrateSwipeLeftPage();
  }

  else if ( isCalibrateSwipeLeftPage() ){
    clickCalibrateSwipeRightPage();
  }

  else if ( isCalibrateSwipeRightPage() ){
    clickCalibratePointingPage();
  }

  else if ( isCalibratePointingPage() ){
    clickCalibrateRotatePage();
  }

  else if ( isCalibrateRotatePage() ){
    clickCalibrateZoomPage();
  }

  else if ( isCalibrateZoomPage() ){
    clickTableOfContents();
  }

  else if ( isTableOfContents()){
    clickLungsPage();
  }

  else if (isLungsPage() ){
    clickHeartPage();
  }

  else if (isHeartPage() ){
    clickTestTableOfContents();
  }

  else if (isTestTableOfContents() ){
    clickTestPage();
  }

  else if (isTestingPage()){
    clickFillInBlankPage();
  }

  else if (isFillInBlankPage()) {
    clickClosePage(); 
  }

}


// function that allows the user to go to the previous page they were just on
function swipeRight(destinationState) {
  //click on the back button when the user swipes right
  window.history.back();
}


// checks what page the user is on
function isHomePage(){
  return document.URL.includes("home.html");
}

function isCalibrateIntroPage(){
  return document.URL.includes("calibrate-intro.html");
}

function isCalibratePointingPage(){
  return document.URL.includes("calibrate-pointing.html");
}

function isCalibrateRotatePage(){
  return document.URL.includes("calibrate-rotate.html");
}

function isCalibrateSwipeLeftPage(){
  return document.URL.includes("calibrate-swipe-left.html");
}

function isCalibrateSwipeRightPage(){
  return document.URL.includes("calibrate-swipe-right.html");
}

function isCalibrateZoomPage(){
  return document.URL.includes("calibrate-zoom.html");
}

function isTeachingPage(){
  return document.URL.includes("lungs.html") || document.URL.includes("heart.html");
}

function isTestingPage(){
  return document.URL.includes("lungDiagramTest.html");
}

function isFillInBlankPage(){
  return document.URL.includes("fill-in-blank.html");
}

function isLungsPage(){
  return document.URL.includes("lungs.html");
}

function isHeartPage(){
  return document.URL.includes("heart.html");
}

function isHelpSpeechPage(){
  return document.URL.includes("help-speech.html");
}

function isHelpGesturePage(){
  return document.URL.includes("help-gesture.html");
}

function isTableOfContents(){
  return document.URL.includes("table-of-contents.html");
}

function isTestTableOfContents(){
  return document.URL.includes("test-t-of-contents.html");
}



// triggers click on certain page
function clickMainMenuPage(){
  $( "#menu" )[0].click();
}

function clickHeartPage(){
  $( "#heart" )[0].click();
}

function clickHelpSpeechPage(){
  $( "#help-speech" )[0].click();
}

function clickHelpGesturePage(){
  $( "#help-gesture" )[0].click();
}

function clickTestPage(){
  $( "#test" )[0].click();
}

function clickFillInBlankPage(){
  $( "#fill-in-blank" )[0].click();
}

function clickLungsPage(){
  $( "#lungs" )[0].click();
}

function clickHomePage(){
  $( "#home" )[0].click();
}

function clickClosePage(){
  $( "#close" )[0].click();
}

function clickCalibrateIntroPage(){
  $( "#calibrate-intro" )[0].click();
}

function clickCalibratePointingPage(){
  $( "#calibrate-pointing" )[0].click();
}

function clickCalibrateRotatePage(){
  $( "#calibrate-rotate" )[0].click();
}

function clickCalibrateSwipeLeftPage(){
  $( "#calibrate-swipe-left" )[0].click();
}

function clickCalibrateSwipeRightPage(){
  $( "#calibrate-swipe-right" )[0].click();
}

function clickCalibrateZoomPage(){
  $( "#calibrate-zoom" )[0].click();
}

function clickTableOfContents(){
  $( "#table-of-contents" )[0].click();
}

function clickTestTableOfContents(){
  $( "#test-table-of-contents" )[0].click();
}


//Used to check if a transcript involves a particular word or phrase
function textInvolves(transcript,word){
  return transcript.toLowerCase().includes(word);
}

//Used to process answers provided in the lungDiagramTest
function processAnswer(word, isHoveringOver){
  if (isTestingPage()){
    if (word == "trachea" && isHoveringOver){
        document.getElementById("trachea-div").style.visibility = "visible";
        document.getElementById("trachea-div").style.color = "green";
        return true;
      }

    else if (word == 'bronchi' && isHoveringOver){
        document.getElementById("bronchus-div").style.visibility = "visible";
        document.getElementById("bronchus-div").style.color = "green";
        return true;
      }

    else if (word =='left lung' && isHoveringOver){
        document.getElementById("left-lung-div").style.visibility = "visible";
        document.getElementById("left-lung-div").style.color = "green";
        return true;
      }

    else if (word == 'right lung' && isHoveringOver){
        //mark correct and highlight in green
        document.getElementById("right-lung-div").style.visibility = "visible";
        document.getElementById("right-lung-div").style.color = "green";
        return true;
      }

    else{
        document.getElementById("wrong-tag").style.visibility = "visible";
        document.getElementById("wrong-tag").style.color = "red";
        //mark wrong and store
        setTimeout(function() {
            document.getElementById("wrong-tag").style.visibility = "hidden";
            return false;
          }, 5000);
    }

  }
}



//Functions used for reading text in the Lungs module
function readLungs(){
  voicesReady = true;
  generateSpeech("The lungs are a pair of spongy, air-filled, organs located on either side of the chest.");
  setTimeout(function(){ 
        //show icon for duration
      document.getElementById("speaker-img").style.visibility = "hidden";

    }, 6000);
}

function readTrachea(){
  voicesReady = true;
  generateSpeech("The trachea conducts inhaled air into the lungs through its tubular branches, called bronchi.");
  setTimeout(function(){ 
        //show icon for duration
      document.getElementById("speaker-img").style.visibility = "hidden";

    }, 7500);
}

function readBronchi(){
  voicesReady = true;
  generateSpeech("The bronchi divide into smaller and smaller branches called bronchioles, finally becoming microscopic.");
  setTimeout(function(){ 
        //show icon for duration
      document.getElementById("speaker-img").style.visibility = "hidden";

    }, 7500);
}

function readBronchioles(){
  voicesReady = true;
  generateSpeech("The bronchioles eventually end in clusters of microscopic air sacs called alveoli.");
  setTimeout(function(){ 
        //show icon for duration
      document.getElementById("speaker-img").style.visibility = "hidden";

    }, 6000);
}

function readAlveoli(){
  voicesReady = true;
  generateSpeech("In the alveoli, oxygen from the air is absorbed into the blood. Carbon dioxide, travels from the blood to the alveoli, where it can be exhaled.");
  setTimeout(function(){ 
        //show icon for duration
      document.getElementById("speaker-img").style.visibility = "hidden";
    }, 9500);
}

function readPleura(){
  voicesReady = true;
  generateSpeech("The pleura is a thin layer of fluid that acts as a lubricant, allowing the lungs to slip smoothly as they expand and contract with each breath.");
  setTimeout(function(){ 
      document.getElementById("speaker-img").style.visibility = "hidden";
    }, 9500);
}


