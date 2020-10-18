//JavaScript loading of 3-D lungs model using Three.js
	if ( WEBGL.isWebGLAvailable() === false ) {

		document.body.appendChild( WEBGL.getWebGLErrorMessage() );

	}

	var container, stats;
	var scene, renderer, raycaster; 

	var mixer;
	var clock = new THREE.Clock();

	var cube;
	var spritey; 
	var spritey2; 
	var spritey3; 
	var spritey4; 
	var line; 
	var line2; 
	var line3; 
	var line4; 

	init();
	animate();

	function init() {

		container = document.createElement( 'div' );
		document.body.appendChild( container );

		// There's no reason to set the aspect here because we're going
		// to set it every frame anyway so we'll set it to 2 since 2
		// is the the aspect for the canvas default size (300w/150h = 2)
		camera = new THREE.PerspectiveCamera(75, 2, 5, 1000);
		camera.position.set( 50, -150, -80 );

		controls = new THREE.OrbitControls( camera );
		controls.target.set( 50, 45, 0 );
		controls.update();

		scene = new THREE.Scene();
		scene.background = new THREE.Color( 0xa0a0a0 );

		//Set up light to illuminate the canvas
		var light = new THREE.AmbientLight( {color: 0x404040, intensity: 80}  ); // soft white light
		scene.add( light );


		//Load the 3D model
		var loader = new THREE.GLTFLoader().setPath( 'models/Lung/' );
		loader.load( 'scene.gltf', function ( gltf ) {

			const model = gltf.scene;
			scene.add(model);
			mixer = new THREE.AnimationMixer(model);
			gltf.animations.forEach((clip) => {
			    mixer.clipAction(clip).play();
			});

			scene.add( gltf.scene );

		} );

		//Render the model onto the canvas
		renderer = new THREE.WebGLRenderer({antialias: true , canvas: document.getElementById("canvas")});
		renderer.gammaOutput = true;

		window.addEventListener( 'resize', onWindowResize, false );

		//Create different lines and labels for the model
		var material = new THREE.LineBasicMaterial({
			color: 0x000000
		});

		var geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3( -10, 70, 0 ),
			new THREE.Vector3( -100, 100, 0 )
		);

		line = new THREE.Line( geometry, material );
		spritey = makeTextSprite( "trachea", 
			{ fontsize: 40, borderColor: {r:255, g:0, b:0, a:1.0}, backgroundColor: {r:255, g:100, b:100, a:0.8} } );
		spritey.position.set(-100, 100, 0);
		line.add( spritey );
		scene.add( line );

		
		var geometry2 = new THREE.Geometry();
		geometry2.vertices.push(
			new THREE.Vector3( 0, 10, 10 ),
			new THREE.Vector3( 0, -70, 0 )
		);

		line2 = new THREE.Line( geometry2, material );
		spritey2 = makeTextSprite( "bronchi", 
			{ fontsize: 40, borderColor: {r:255, g:0, b:0, a:1.0}, backgroundColor: {r:255, g:100, b:100, a:0.8} } );
		spritey2.position.set(-20, -90, 0);
		line2.add( spritey2 );
		scene.add( line2 );
		

		var geometry3 = new THREE.Geometry();
		geometry3.vertices.push(
			new THREE.Vector3( 70, 10, 10 ),
			new THREE.Vector3( 150, -50, 0 )
		);

		line3 = new THREE.Line( geometry3, material );
		spritey3 = makeTextSprite( "left lung", 
			{ fontsize: 40, borderColor: {r:255, g:0, b:0, a:1.0}, backgroundColor: {r:255, g:100, b:100, a:0.8} } );
		spritey3.position.set(150, -50, 0);
		line3.add( spritey3 );
		scene.add( line3 );

		var geometry4 = new THREE.Geometry();
		geometry4.vertices.push(
			new THREE.Vector3( -70, 10, 10 ),
			new THREE.Vector3( -160, -50, 0 )
		);

		line4 = new THREE.Line( geometry4, material );
		spritey4 = makeTextSprite( "right lung", 
			{ fontsize: 40, borderColor: {r:255, g:0, b:0, a:1.0}, backgroundColor: {r:255, g:100, b:100, a:0.8} } );
		spritey4.position.set(-160, -50, 0);
		line4.add( spritey4 );
		scene.add( line4 );

		function makeTextSprite( message, parameters )
		{
			if ( parameters === undefined ) parameters = {};
			
			var fontface = parameters.hasOwnProperty("fontface") ? 
				parameters["fontface"] : "Arial";
			
			var fontsize = parameters.hasOwnProperty("fontsize") ? 
				parameters["fontsize"] : 18;
			
			var borderThickness = parameters.hasOwnProperty("borderThickness") ? 
				parameters["borderThickness"] : 4;
			
			var borderColor = parameters.hasOwnProperty("borderColor") ?
				parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
			
			var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
				parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };

			// var spriteAlignment = THREE.SpriteAlignment.topLeft;
				
			var canvas = document.createElement('canvas');
			var context = canvas.getContext('2d');
			context.font = "Bold " + fontsize + "px " + fontface;
		    
			// get size data (height depends only on font size)
			var metrics = context.measureText( message );
			var textWidth = metrics.width;
			
			// background color
			context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
										  + backgroundColor.b + "," + backgroundColor.a + ")";
			// border color
			context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
										  + borderColor.b + "," + borderColor.a + ")";

			context.lineWidth = borderThickness;			
			// text color
			context.fillStyle = "rgba(0, 0, 0, 1.0)";
			context.fillText( message, borderThickness, fontsize + borderThickness);
			
			// canvas contents will be used for a texture
			var texture = new THREE.Texture(canvas) 
			texture.needsUpdate = true;

			var spriteMaterial = new THREE.SpriteMaterial( 
				{ map: texture, useScreenCoordinates: false } );
			var sprite = new THREE.Sprite( spriteMaterial );
			sprite.scale.set(100,50,1.0);
			return sprite;	
		}


		window.addEventListener( 'resize', onWindowResize, false );

	}


	function resizeCanvasToDisplaySize() {
	  const canvas = renderer.domElement;
	  // look up the size the canvas is being displayed
	  const width = canvas.clientWidth;
	  const height = canvas.clientHeight;

	  // adjust displayBuffer size to match
	  if (canvas.width !== width || canvas.height !== height) {
	    // you must pass false here or three.js sadly fights the browser
	    renderer.setSize(width, height, false);
	    camera.aspect = width / height;
	    camera.updateProjectionMatrix();
	  }
	}

	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}

	function animate() {

		requestAnimationFrame( animate );

		var delta = clock.getDelta();

		resizeCanvasToDisplaySize();

		if ( mixer ) mixer.update( delta );

		renderer.render( scene, camera );

	}
