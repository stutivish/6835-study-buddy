var speaking = false;
var hand; 
var counter = true; 


/*  Main Leap loop
  Implements logic for reading when calibrating 
  Params: hand 
*/ 
  var colors = [0xff0000, 0x00ff00, 0x0000ff];
  var baseBoneRotation = (new THREE.Quaternion).setFromEuler(
      new THREE.Euler(Math.PI / 2, 0, 0)
  );
  Leap.loop({enableGestures: true}, 
    function (frame) {
      if (frame.hands.length > 0) {
        hand = frame.hands[0]; 
        hand.fingers.forEach(function (finger) {
          // This is the meat of the example - Positioning `the cylinders on every frame:
          finger.data('boneMeshes').forEach(function(mesh, i){
            var bone = finger.bones[i];
            mesh.position.fromArray(bone.center());
            mesh.setRotationFromMatrix(
              (new THREE.Matrix4).fromArray( bone.matrix() )
            );
            mesh.quaternion.multiply(baseBoneRotation);
          });
          finger.data('jointMeshes').forEach(function(mesh, i){
            var bone = finger.bones[i];
            if (bone) {
              mesh.position.fromArray(bone.prevJoint);
            }else{
              // special case for the finger tip joint sphere:
              bone = finger.bones[i-1];
              mesh.position.fromArray(bone.nextJoint);
            }
          });
        });

        var pinky = hand.pinky; 
        var indexFinger = hand.indexFinger; 
        var middleFinger = hand.middleFinger; 
        var ringFinger = hand.ringFinger; 
        var thumb = hand.thumb; 

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
                        } 

                        if (gesture.state == "stop" && counter==true) { // only register the swipe once the gesture has come to a stop & the counter is true (first stop registered)
                          if (type_swipe == ("swipe right")) {
                            document.getElementById("swipe-right-correct").style.visibility = "visible";
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
      
    renderer.render(scene, camera);
  })
    // these two LeapJS plugins, handHold and handEntry are available from leapjs-plugins, included above.
    // handHold provides hand.data
    // handEntry provides handFound/handLost events.
  .use('handHold')
  .use('handEntry')
  .on('handFound', function(hand){
    hand.fingers.forEach(function (finger) {
      var boneMeshes = [];
      var jointMeshes = [];
      finger.bones.forEach(function(bone) {
        // create joints
        // CylinderGeometry(radiusTop, radiusBottom, height, radiusSegments, heightSegments, openEnded)
        var boneMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(5, 5, bone.length),
            new THREE.MeshPhongMaterial()
        );
        boneMesh.material.color.setHex(0xffffff);
        scene.add(boneMesh);
        boneMeshes.push(boneMesh);
      });
      for (var i = 0; i < finger.bones.length + 1; i++) {
        var jointMesh = new THREE.Mesh(
            new THREE.SphereGeometry(8),
            new THREE.MeshPhongMaterial()
        );
        jointMesh.material.color.setHex(0x0088ce);
        scene.add(jointMesh);
        jointMeshes.push(jointMesh);
      }
      finger.data('boneMeshes', boneMeshes);
      finger.data('jointMeshes', jointMeshes);
    });
 
  })
  .on('handLost', function(hand){
    hand.fingers.forEach(function (finger) {
      var boneMeshes = finger.data('boneMeshes');
      var jointMeshes = finger.data('jointMeshes');
      boneMeshes.forEach(function(mesh){
        scene.remove(mesh);
      });
      jointMeshes.forEach(function(mesh){
        scene.remove(mesh);
      });
      finger.data({
        boneMeshes: null,
        boneMeshes: null
      });
    });
    var armMesh = hand.data('armMesh');
    scene.remove(armMesh);
    hand.data('armMesh', null);
    renderer.render(scene, camera);
  })
  .connect();

  // all units in mm
  var initScene = function () {
    window.scene = new THREE.Scene();
    window.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true , 
      canvas: document.getElementById("canvas")
    });
    window.renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    // look up the size the canvas is being displayed
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    window.renderer.setSize(width, height);

    document.body.appendChild(window.canvas);
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set( 0, 0.5, 1 );
    window.scene.add(directionalLight);
    window.camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    window.camera.position.fromArray([0, 100, 500]);
    window.camera.lookAt(new THREE.Vector3(0, 160, 0));
    window.addEventListener('resize', function () {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.render(scene, camera);
    }, false);
    scene.add(camera);

    renderer.render(scene, camera);
  };
  initScene();


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
    if (textInvolves(transcript, 'swipe left') || textInvolves(transcript, 'next') || textInvolves(transcript, 'skip')){
      swipeLeft();
      processed = true;
    }

    else if (textInvolves(transcript, 'swipe right') || textInvolves(transcript, 'previous') || textInvolves(transcript, 'back')){
      swipeRight();
      processed = true;
    }

  return processed;
};



