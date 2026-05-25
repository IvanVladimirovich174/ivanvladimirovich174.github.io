 	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

	var deviceSettings = {
		isWebGL: false,
		isAndroid: null,
		isEarlyIE: null,
		isIE: null,
		isIEMobile: null,
		isiPod: null,
		isiPhone: null,
		isiPad: null,
		isiOS: null,
		isMobile: null,
		isTablet: null,
		isWinSafari: null,
		isMacSafari: null
		};

	function setupDeviceSettings() {
		var ua = navigator.userAgent.toLowerCase();
		deviceSettings.isAndroid = ua.indexOf("android") > -1;
		//deviceSettings.isEarlyIE = (jQuery.browser.msie == true && Number(jQuery.browser.version) <= 8) ? true : false;
		//deviceSettings.isIE = jQuery.browser.msie == true;
		deviceSettings.isiPod = navigator.userAgent.match(/iPod/i) !== null;
		deviceSettings.isiPhone = navigator.userAgent.match(/iPhone/i) !== null;
		deviceSettings.isiPad = navigator.userAgent.match(/iPad/i) !== null;
		deviceSettings.isiOS = (navigator.userAgent.match(/(iPad|iPhone|iPod)/i) ? true : false);
		deviceSettings.isIEMobile = navigator.userAgent.match(/iemobile/i) !== null;
		//determine if this is a mobile browser:
		var p = navigator.platform.toLowerCase();
		if (deviceSettings.isIEMobile || deviceSettings.isAndroid || deviceSettings.isiPad || p === 'ipad' || p === 'iphone' || p === 'ipod' || p === 'android' || p === 'palm' || p === 'windows phone' || p === 'blackberry' || p === 'linux armv7l') {
			deviceSettings.isMobile = true;
			$('body').addClass('isMobile');
		} else {
			$('body').addClass('isDesktop');
		}

		if ( Detector.webgl ) {
			deviceSettings.isWebGL = true;
		}
		if (deviceSettings.isAndroid || deviceSettings.isIEMobile) deviceSettings.isWebGL = false;
	}

	var container, camera, scene, renderer, stats, statsCreated, i, x, y, b;

	var mouse = new THREE.Vector2(), mouseX = 0, mouseY = 0,
		mouseXOnMouseDown = 0, mouseYOnMouseDown = 0,
		clientMouseX = 0, clientMouseY = 0, initMouseX,
		openingCameraZ = 1000, //400,
		targetCameraZ = 250,
		windowHalfX = window.innerWidth / 2, windowHalfY = window.innerHeight / 2,
		toRAD = Math.PI/180, radianLoop = 6.28319,
		openingRotationX = 0.45,
		targetRotationX = 0.45,
		targetRotationXOnMouseDown = 0.45,
		openingRotationY = 65 * toRAD,
		targetRotationY = 65 * toRAD,
		targetRotationYOnMouseDown = 90 * toRAD,
		lastTouchX, lastTouchY,
		isMouseDown = false, isMouseMoved = false, isGlobeRotated = false, isGlobeEventsEnabled = false;

	var globeRaycaster = new THREE.Raycaster(), intersects,  intersection = null, isParticleHit = false, isMediaHit = false;
		globeRaycaster.params.Points.threshold = 0.4;

	var colorPrimary_Base = "#33CCFF";
	var colorSecondary_Base = "#FF1313"; //#FF0000
	var colorPrimary = colorPrimary_Base;
	var colorSecondary = colorSecondary_Base;
	var colorDarken = "#000000";
	var colorBrighten = "#FFFFFF";
	var colorBase 	= new THREE.Color(colorPrimary),
		colorBase50 = new THREE.Color(shadeBlend(0.50, colorPrimary, colorDarken)),
		colorBase75 = new THREE.Color(shadeBlend(0.75, colorPrimary, colorDarken)),
		colorBase85 = new THREE.Color(shadeBlend(0.85, colorPrimary, colorDarken)),
		colorHighlight 	= new THREE.Color(colorSecondary);

	// CREATE THE WEBGL CONTAINER ////////////////////////////////////////
	function initWebgl() {
		setupDeviceSettings();

		container = document.getElementById("interactive");

		var width  = window.innerWidth, height = window.innerHeight;

		scene = new THREE.Scene();
		scene.fog = new THREE.Fog( 0x000000, 0, 400 );

		camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
		camera.position.x = 0;
		camera.position.y = 0;
		camera.position.z = openingCameraZ;
		camera.rotation.x = 0;
		camera.rotation.y = 0;
		camera.rotation.z = 0;

		var functionArr =  [
			{ fn: createGroup, 			vars: [stepComplete] },
			{ fn: createLights, 		vars: [stepComplete] },
			{ fn: createUniverse, 		vars: [stepComplete] },
			{ fn: createGlobe, 			vars: [stepComplete] },
			{ fn: createDots, 			vars: [stepComplete] },
			{ fn: createMedia, 			vars: [stepComplete] },
			{ fn: createArcsSnake, 		vars: [stepComplete] },
			{ fn: createArcsRocket, 	vars: [stepComplete] },
			{ fn: createArcsAll, 		vars: [stepComplete] },
			{ fn: createRings, 			vars: [stepComplete] },
			{ fn: createSpikes, 		vars: [stepComplete] },
			{ fn: createRingPulse, 		vars: [stepComplete] },
			{ fn: createRain, 			vars: [stepComplete] },
			{ fn: createMinimapBg, 		vars: [stepComplete] },
			{ fn: createGlitch, 		vars: [stepComplete] },
			{ fn: createPreloader, 		vars: [stepComplete] },
			//{ fn: createGyroscope, 		vars: [stepComplete] },
			{ fn: createStars, 			vars: [stepComplete] },
			{ fn: initAudio, 			vars: null }
	    ];

		arrayExecuter.execute(functionArr);

		renderer = new THREE.WebGLRenderer({
			antialias : true,
			alpha: false
		});
		renderer.setSize(width, height);
		renderer.setClearColor (0x000000, 1);
		//renderer.sortObjects = false;

		container.appendChild( renderer.domElement );

		animate();
	}


	// PRELOADER ////////////////////////////////////////
	var preloaderAnimationIn,
		preloaderAnimationInComplete = false,
		preloaderAnimationOut,
		preloaderArray = [],
		preloaderComplete = false,
		preloaderLoaded = 0,
		preloaderTotal = 0,
		preloaderSplitText,
		preloaderSplitTextWordTotal,
		isIntroDone = false,
		introAnimation;

	function createPreloader(callbackFn) {
		TweenMax.set( "#bookNumber", { transformPerspective: 600, perspective: 300, transformStyle: "preserve-3d" });
		TweenMax.set( "#bookQuote", { transformPerspective: 600, perspective: 300, transformStyle: "preserve-3d" });
		TweenMax.set( "#preloaderBar", { scaleX: 0, autoAlpha: 0, transformOrigin: 'center center' });
		//TweenMax.set( "#preloaderBar", { autoAlpha: 0, transformOrigin: 'center center' });
		TweenMax.set( "#preloaderBarInner", { scaleX: 0, autoAlpha: 0, transformOrigin: 'center center' });
		//TweenMax.set( ".close line", { drawSVG: "50% 50%", stroke: "#FFFFFF", autoAlpha: 0 } );
		TweenMax.set( ".close line", { attr:{ x1: 25, y1: 25, x2: 25, y2: 25 }, stroke: "#FFFFFF", autoAlpha: 0 } );
		TweenMax.set( ".close circle", { drawSVG: "50% 50%", stroke: "#FFFFFF", autoAlpha: 0 } );
		TweenMax.set( ".overlay", { autoAlpha: 0 });
		TweenMax.set( ".cover, .overlay, .page", { transformPerspective: 800, perspective: 300, transformStyle: "preserve-3d", transformOrigin: "left center" });

		changeTagline();
		preloaderSplitText = new SplitText("#bookQuote", {type:"words"});
		preloaderSplitTextWordTotal = preloaderSplitText.words.length;

		preloaderAnimationIn =  new TimelineMax({ paused: true, delay: 0.25, onComplete: function () {
			preloaderAnimationInComplete = true;
			startPreloader();
		}} );

		preloaderAnimationIn.fromTo( "#intro_book", 2, { autoAlpha: 0 }, { autoAlpha: 1, display: 'block', ease: Linear.easeNone }, 0 );
		preloaderAnimationIn.fromTo( "#intro_book", 2, { scale: 0.8 }, { scale: 1, ease: Power4.easeOut }, 0 );

		preloaderAnimationIn.fromTo( "#intro_book .overlay", 2, { autoAlpha: 0 }, { autoAlpha: 1, immediateRender: false, ease: Linear.easeNone }, 0.5 );
		preloaderAnimationIn.fromTo( "#intro_book .cover, #intro_book .overlay", 2, { rotationY: 0 }, { rotationY: -40, immediateRender: false, ease: Expo.easeOut }, 0.5 );
		preloaderAnimationIn.fromTo( "#intro_book .page1", 2, { rotationY: 0 }, { rotationY: -34, immediateRender: false, ease: Expo.easeOut }, 0.5 );
		preloaderAnimationIn.fromTo( "#intro_book .page2", 2, { rotationY: 0 }, { rotationY: -27, immediateRender: false, ease: Expo.easeOut }, 0.5 );
		preloaderAnimationIn.fromTo( "#intro_book .page3", 2, { rotationY: 0 }, { rotationY: -15, immediateRender: false, ease: Expo.easeOut }, 0.5 );

		preloaderAnimationIn.to( "#intro_book .overlay", 2, { autoAlpha: 0, immediateRender: false }, 2.5 );
		preloaderAnimationIn.to( "#intro_book .overlay", 2, { rotationY: 0, immediateRender: false }, 2.5 );
		preloaderAnimationIn.to( "#intro_book .cover", 2, { rotationY: 0, immediateRender: false }, 2.5 );
		preloaderAnimationIn.to( "#intro_book .page", 2, { rotationY: 0, immediateRender: false }, 2.5 );

		preloaderAnimationIn.fromTo( "#intro_book", 2, { autoAlpha: 1 }, { autoAlpha: 0, immediateRender: false, ease: Linear.easeNone }, 2.5 );
		preloaderAnimationIn.fromTo( "#intro_book", 2, { scale: 1 }, { scale: 0.8, immediateRender: false, ease: Power4.easeIn }, 2.5 );


		preloaderAnimationIn.from( "#bookNumber", 1, { z: generateRandomNumber(-200,-50), autoAlpha: 0, ease: Linear.easeNone }, 5 );
		preloaderAnimationIn.fromTo( "#preloaderInner", 1, { autoAlpha: 0 }, { autoAlpha: 1, ease: Expo.easeOut }, 5 );
		for(var i = 0; i < preloaderSplitTextWordTotal; i++){
			preloaderAnimationIn.from(preloaderSplitText.words[i], 2, { z: generateRandomNumber(-200,-50), rotationX: 0, autoAlpha: 0, ease: Expo.easeOut }, 5 + Math.random() * 1 );
		}
		preloaderAnimationIn.fromTo( "#preloaderBar", 1, { scaleX: 0.5, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, ease: Expo.easeOut }, 7 );

		TweenMax.staggerFromTo( "#bookNumber, #bookQuote div", 3, { color: "#FFFFFF" }, { color: "#FFFFFF", delay: 6 }, 0.1 );


		preloaderAnimationIn.timeScale(1);
		preloaderAnimationIn.play(0);

		if (callbackFn) {
			callbackFn();
		}
	}

	function startPreloader() {
		preloaderArray.push("img/dot-inverted.png");
		preloaderArray.push("img/earth-glow.jpg");
		preloaderArray.push("img/ring_explosion.jpg");
		preloaderArray.push("img/map.png");
		preloaderArray.push("img/map_inverted.png");
		preloaderArray.push("img/photo.png");
		preloaderArray.push("img/universe.jpg");
		preloaderArray.push("img/hex.jpg");
		preloaderArray.push("img/mapDetails.png");
		preloaderArray.push("img/mapLines.png");
		preloaderArray.push("img/mapCircles.png");
		preloaderArray.push("img/mapExtras1.png");
		preloaderArray.push("img/mapExtras2.png");
		preloaderArray.push("img/mapGradient1.png");
		preloaderArray.push("img/mapGradient2.png");

		preloaderTotal = preloaderArray.length;
		for (var i = 0; i < preloaderArray.length; i++) {
			var image = new Image();
			image.src = preloaderArray[i];
			image.onload = function(){
			   checkPreloader();
			};
		}
		//TweenMax.fromTo( "#preloaderBar", 1, { scaleX: 0, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, ease: Expo.easeOut });
		TweenMax.fromTo( "#preloaderBarInner", 3, { backgroundColor: "#485fab" }, { backgroundColor: "#33CCFF", ease: Linear.easeNone } );
		TweenMax.staggerTo( "#bookQuote div, #bookNumber", 2, { color: "#33CCFF", immediateRender: false, ease: Linear.easeNone }, 0.1 );
	}

	function checkPreloader() {
		preloaderLoaded++;
		var tempPercentage = (preloaderLoaded/preloaderTotal);
		if (preloaderLoaded === preloaderTotal) {
			preloaderComplete = true;
			if( preloaderAnimationInComplete) {
				//initExperience();
			}
		}

		TweenMax.to( "#preloaderBarInner", 1, { scaleX: tempPercentage, autoAlpha: 1, transformOrigin: 'center center', ease: Expo.easeOut, onComplete: function () {
			if(preloaderComplete) {
				finishPreloader();
				initExperience();
			}
		}});
	}

	function finishPreloader() {
		preloaderAnimationOut =  new TimelineMax({ paused: true, onComplete: function () {
			playIntro();
		}} );
		preloaderAnimationOut.to( "#preloaderBar", 1, { scaleX: 0, autoAlpha: 0, ease: Expo.easeIn, immediateRender: false, transformOrigin: 'center center' }, 0);
		preloaderAnimationOut.to( "#preloaderInner", 2, { autoAlpha: 0 });

		for(var i = 0; i < preloaderSplitTextWordTotal; i++){
			preloaderAnimationOut.to(preloaderSplitText.words[i], 2, { z: generateRandomNumber(-200,-50), autoAlpha: 0, immediateRender: false, ease: Expo.easeIn }, Math.random() * 1 );
		}


		preloaderAnimationOut.timeScale(1);
		preloaderAnimationOut.play(0);
	}

    var arrayExecuter = new ArrayExecuter();
	var stepComplete = arrayExecuter.stepComplete_instant.bind(arrayExecuter);

	function initExperience() {
		document.getElementById("interactive").addEventListener( 'mousedown', onDocumentMouseDown, false );
		document.getElementById("interactive").addEventListener( 'mousemove', onDocumentMouseMove, false );
		document.getElementById("interactive").addEventListener( 'mouseup', onDocumentMouseUp, false );
		document.getElementById("interactive").addEventListener( 'mouseleave', onDocumentMouseLeave, false );

		document.getElementById("interactive").addEventListener( 'touchstart', onDocumentTouchStart, false );
		document.getElementById("interactive").addEventListener( 'touchmove', onDocumentTouchMove, false );
		document.getElementById("interactive").addEventListener( 'touchend', onDocumentTouchEnd, false );

    	document.getElementById("interactive").addEventListener('mousewheel', onMouseWheel, false);

		document.addEventListener('gesturestart', function (e) {
			e.preventDefault();
		});

		window.addEventListener( 'resize', onWindowResize, false );
		onWindowResize();

		initButtons();
	}

	function playIntro() {
		isGlobeRotated = true;
		isGlobeEventsEnabled = true;

		TweenMax.set("#ui svg", { rotation: -90, transformOrigin:"center center"});
		TweenMax.set( "#bracket-left", { drawSVG: "20% 30%" } );
		TweenMax.set( "#bracket-right", { drawSVG: "70% 80%"} );

		introAnimation =  new TimelineMax({ paused: true, force3D: true,
			onComplete:function(){
				//setArcAnimation("snake");
				isIntroDone = true;
				//changeStat();
			}
		});
		introAnimation.fromTo( "#preloader", 2, { autoAlpha: 1 }, { autoAlpha: 0, ease: Linear.easeNone }, 0 );
		////introAnimation.fromTo( "#bracket-left", 1, { autoAlpha: 0 }, { autoAlpha: 0.5, ease: Linear.easeNone }, 1.25 );
		////introAnimation.fromTo( "#bracket-right", 1, { autoAlpha: 0 }, { autoAlpha: 0.5, ease: Linear.easeNone }, 1.25 );
		////introAnimation.fromTo( "#bracket-left", 2, { drawSVG: "25% 25%" }, { drawSVG: "20% 30%", ease: Expo.easeInOut }, 1.25 );
		////introAnimation.fromTo( "#bracket-right", 2, { drawSVG: "75% 75%" }, { drawSVG: "70% 80%", ease: Expo.easeInOut }, 1.25 );
		introAnimation.staggerFromTo( "#header .animate", 2, { y: -75 }, { y: 0, ease: Expo.easeInOut }, -0.1, 1 );
		introAnimation.fromTo( "#nav-left a", 2, { x: 100, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: Expo.easeInOut }, 0.1, 2 );
		introAnimation.fromTo( "#nav-right a", 2, { x: -100, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: Expo.easeInOut }, 0.1, 2 );

		introAnimation.staggerFromTo( "#arcMode .optionitem", 2, { x: -150, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: Expo.easeOut }, -0.1, 1.5 );
		introAnimation.staggerFromTo( "#colorMode .optionitem", 2, { x: 150, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: Expo.easeOut }, 0.1, 1.5 );
		introAnimation.fromTo( ".category", 2, { autoAlpha: 0 }, { autoAlpha: 1 }, 2 );
		//introAnimation.staggerFromTo( "#arcMode .optionitem", 2, { autoAlpha: 0 }, { autoAlpha: 1, ease: Linear.easeNone }, 0.1, 2 );
		//introAnimation.staggerFromTo( "#colorMode .optionitem", 2, { autoAlpha: 0 }, { autoAlpha: 1, ease: Linear.easeNone }, 0.1, 2 );

		//introAnimation.fromTo( "#minimapBackground, #minimap", 3, { y: 200 }, { y: 0, ease: Expo.easeInOut }, 1 );
		//introAnimation.staggerFromTo( "#minimap .animate_stroke", 2, { drawSVG: "50% 50%" }, { drawSVG: "0% 100%", ease: Quint.easeInOut }, 0.1, 1 );
		//introAnimation.fromTo( "#minimap .animate_stroke", 1, { attr:{ "fill-opacity": 0 } }, { attr: {"fill-opacity": 1 } , ease: Linear.easeNone }, 0.1, 3 );
		introAnimation.fromTo( "#minimapBackground", 1, { autoAlpha: 0 }, { autoAlpha: 1 }, 1 );
		introAnimation.fromTo( "#minimap", 2, { autoAlpha: 0 }, { autoAlpha: 1 }, 2 );

		introAnimation.fromTo( "#palette", 2, { y: 50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, ease: Expo.easeOut }, 1.25 );
		introAnimation.fromTo( "#soundButton", 2, { x: -50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: Expo.easeOut }, 1.75 );
		introAnimation.fromTo( "#rotationMode", 2, { x: 50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: Expo.easeOut }, 1.75 );

		introAnimation.timeScale(1);
		introAnimation.play();



		var minimapAnimation2 =  new TimelineMax({ paused: true, delay: 3 });

		minimapAnimation2.fromTo( minimapSpiral, 1, { pixi:{ alpha: 0 }}, { pixi:{ alpha: 1 }, ease: Linear.easeNone}, 0 );
		minimapAnimation2.fromTo( minimapDetails, 1, { pixi:{ alpha: 0 }}, { pixi:{ alpha: 1 }, ease: Linear.easeNone}, 0 );
		minimapAnimation2.fromTo( minimapLines, 1, { pixi:{ alpha: 0 }}, { pixi:{ alpha: 1 }, ease: Linear.easeNone}, 0 );

		minimapAnimation2.to( minimapDetails, 1,  { pixi:{ tint: colorPrimary} }, 3 );
		minimapAnimation2.fromTo( minimapLines, 2, { pixi:{ tint: 0xFFFFFF }}, { pixi:{ tint: colorPrimary }, ease: Linear.easeNone }, 0 );
		minimapAnimation2.fromTo( minimapMaskGradient, 2, { pixi:{ scaleX: 0 }}, { pixi:{ scaleX: 1.25 }, ease: Expo.easeOut }, 0 );
		minimapAnimation2.fromTo( minimapSpiral, 2, { pixi:{ rotation: 90 }}, { pixi:{ rotation: 450 }, ease: Expo.easeOut}, 0 );
		minimapAnimation2.fromTo( minimapSpiral, 0.1, { pixi:{ alpha: 0 }}, { pixi:{ alpha: 1 }, immediateRender: false, ease: Linear.easeNone }, 0 );
		minimapAnimation2.fromTo( minimapSpiral, 0.75, { pixi:{ alpha: 1 }}, { pixi:{ alpha: 0 }, immediateRender: false, ease: Linear.easeNone }, 0.2 );
		minimapAnimation2.fromTo( minimapMaskGradient, 2, { pixi:{ alpha: 1 }}, { pixi:{ alpha: 0 }, ease: Linear.easeNone }, 0.5 );
		minimapAnimation2.fromTo( minimapBlipsGroup, 0.65, { pixi:{ scale: 0 }}, { pixi:{ scale: 1 }, ease: Expo.easeOut}, 0 );
		minimapAnimation2.fromTo( minimapBlipArray, 0.75, { pixi:{ alpha: 1 }}, { pixi:{ alpha: 0 }, ease: Linear.easeNone}, 0.5 );
		minimapAnimation2.fromTo( minimapSpikesGroup, 0.75, { pixi:{ scale: 0 }}, { pixi:{ scale: 1 }, ease: Expo.easeOut}, 0 );
		minimapAnimation2.fromTo( minimapXArray, 0.75, { pixi:{ scaleY: 1 }}, { pixi:{ scaleY: 0 }, ease: Circ.easeInOut}, 0.1 );
		minimapAnimation2.fromTo( minimapExtras1, 3, { pixi:{ rotation: 0 }}, { pixi:{ rotation: -360 }, ease: Expo.easeOut}, 0 );
		minimapAnimation2.fromTo( minimapExtras1, 0.1, { pixi:{ alpha: 0 }}, { pixi:{ alpha: 1 }, ease: Linear.easeNone }, 0 );
		minimapAnimation2.fromTo( minimapExtras1, 1, { pixi:{ alpha: 1, tint: 0xFFFFFF }}, { pixi:{ alpha: 0, tint: colorPrimary }, immediateRender: false, ease: Linear.easeNone }, 0.2 );

		minimapAnimation2.fromTo( minimapExtras2, 1.5, { pixi:{ scale: 0.50 }}, { pixi:{ scale: 1.1 }, ease: Expo.easeOut}, 0 );
		minimapAnimation2.fromTo( minimapExtras2, 0.1, { pixi:{ alpha: 0 }}, { pixi:{ alpha: 0.5 }, ease: Linear.easeNone }, 0 );
		minimapAnimation2.fromTo( minimapExtras2, 1, { pixi:{ alpha: 0.5, tint: 0xFFFFFF }}, { pixi:{ alpha: 0, tint: colorPrimary }, immediateRender: false, ease: Linear.easeNone }, 0.2 );

		minimapAnimation2.fromTo( minimapXArray, 1, { pixi:{ tint: 0xFFFFFF }}, { pixi:{ tint: colorPrimary }, ease: Linear.easeNone }, 0 );
		minimapAnimation2.fromTo( minimapBlipArray, 1, { pixi:{ tint: 0xFFFFFF }}, { pixi:{ tint: colorPrimary }, ease: Linear.easeNone }, 0 );

		minimapAnimation2.timeScale(1.5);
		minimapAnimation2.play();


		var descriptionAnimation =  new TimelineMax({ paused: true, delay: 5 });
		descriptionAnimation.fromTo( "#tutorial", 1, { autoAlpha: 0 }, { autoAlpha: 1, immediateRender: false, ease: Linear.easeNone }, 0 );
		descriptionAnimation.fromTo( "#tutorial", 2, { scrambleText:{ text: " " } }, { scrambleText:{ text: "THESE ARE LOCATIONS OF RADIOPOINTS", chars:"0123456789!@#$%^&*()" }, ease: Expo.easeInOut }, 0 );
		descriptionAnimation.fromTo( "#tutorial", 1, { autoAlpha: 0 }, { autoAlpha: 1, immediateRender: false, ease: Linear.easeNone }, 3 );
		descriptionAnimation.fromTo( "#tutorial", 2, { scrambleText:{ text: " " } }, { scrambleText:{ text: "PRESS ON DOT TO SEE LOCATION AND CALLSIGN", chars:"0123456789!@#$%^&*()" }, ease: Expo.easeInOut }, 3 );
		descriptionAnimation.fromTo( "#tutorial", 1, { autoAlpha: 0 }, { autoAlpha: 1, immediateRender: false, ease: Linear.easeNone }, 6 );
		descriptionAnimation.fromTo( "#tutorial", 2, { scrambleText:{ text: " " } }, { scrambleText:{ text: "PLAY WITH THE OPTIONS BELOW", chars:"0123456789!@#$%^&*()" }, ease: Expo.easeInOut }, 6 );
		descriptionAnimation.fromTo( "#tutorial", 1, { autoAlpha: 1 }, { autoAlpha: 0, immediateRender: false, ease: Linear.easeNone }, 9 );
		descriptionAnimation.timeScale(1);
		descriptionAnimation.play();

		setArcAnimation("snake");
		showGlobe();
	}



	// CONTAINER OBJECTS ////////////////////////////////////////
	var rotationObject,
		earthObject;
	function createGroup(callbackFn) {
		rotationObject  = new THREE.Group();
		rotationObject.name = 'rotationObject';
		rotationObject.rotation.x = openingRotationX;
		rotationObject.rotation.y = openingRotationY;
		scene.add(rotationObject);

		earthObject = new THREE.Group();
		earthObject.name = 'earthObject';
		earthObject.rotation.y = -90 * toRAD;
		rotationObject.add(earthObject);

		if (callbackFn) {
			callbackFn();
		}
	}



	// LIGHTS  ////////////////////////////////////////
	var lightShield1,
		lightShield2,
		lightShield3,
		lightShieldIntensity = 1.25,
		lightShieldDistance = 400,
		lightShieldDecay = 2.0,
		lightsCreated = false;
	function createLights(callbackFn) {
		lightShield1 = new THREE.PointLight( colorBase, lightShieldIntensity, lightShieldDistance, lightShieldDecay );
		lightShield1.position.x = -50;
		lightShield1.position.y = 150;
		lightShield1.position.z = 75;
		lightShield1.name = 'lightShield1';
		scene.add( lightShield1 );

		lightShield2 = new THREE.PointLight( colorBase, lightShieldIntensity, lightShieldDistance, lightShieldDecay );
		lightShield2.position.x = 100;
		lightShield2.position.y = 50;
		lightShield2.position.z = 50;
		lightShield2.name = 'lightShield2';
		scene.add( lightShield2 );

		lightShield3 = new THREE.PointLight( colorBase, lightShieldIntensity, lightShieldDistance, lightShieldDecay );
		lightShield3.position.x = 0;
		lightShield3.position.y = -300;
		lightShield3.position.z = 50;
		lightShield3.name = 'lightShield3';
		scene.add( lightShield3 );

		lightsCreated = true;

		if (callbackFn) {
			callbackFn();
		}
	}



	// TILT OBJECT ////////////////////////////////////////
	var ringsObject,
		ringsOuterMaterial,
		ringsInnerMaterial,
		ringsCreated = false;
	function createRings(callbackFn) {
		ringsObject = new THREE.Group();
		ringsObject.name = 'ringsObject';
		scene.add( ringsObject );

		var ringLargeGeometry = new THREE.RingGeometry( 200, 195, 128 );
		var ringMediumGeometry = new THREE.RingGeometry( 100, 98, 128 );

		ringsOuterMaterial = new THREE.MeshBasicMaterial( {
			color: colorBase75, //colorBase85,
			transparent: true,
			blending: THREE.AdditiveBlending,
			side: THREE.DoubleSide,
			fog: true,
			depthWrite: false//, depthTest: false
		});
		ringsInnerMaterial = new THREE.MeshBasicMaterial( {
			color: colorBase50, //colorBase75,
			transparent: true,
			blending: THREE.AdditiveBlending,
			side: THREE.DoubleSide,
			fog: true,
			depthWrite: false//, depthTest: false
		});

		var ringLargeMesh1 = new THREE.Mesh( ringLargeGeometry, ringsOuterMaterial );
		ringLargeMesh1.rotation.x = 90 * toRAD;
		var ringLargeMesh2 = ringLargeMesh1.clone();
		ringLargeMesh1.position.y = 90;
		ringLargeMesh2.position.y = -90;
		ringsObject.add( ringLargeMesh1 );
		ringsObject.add( ringLargeMesh2 );

		var ringMediumMesh1 = new THREE.Mesh( ringMediumGeometry, ringsInnerMaterial );
		ringMediumMesh1.rotation.x = 90 * toRAD;
		var ringMediumMesh2 = ringMediumMesh1.clone();
		ringMediumMesh1.position.y = 100;
		ringMediumMesh2.position.y = -100;
		ringsObject.add( ringMediumMesh1 );
		ringsObject.add( ringMediumMesh2 );

		ringsCreated = true;

		if (callbackFn) {
			callbackFn();
		}
	}

	function renderRings() {
		ringsObject.rotation.x = ringsObject.rotation.x += ( targetTiltX - ringsObject.rotation.x ) * 0.25;
		ringsObject.rotation.z = ringsObject.rotation.z -= ( targetTiltY + ringsObject.rotation.z ) * 0.25;
	}



	// UNIVERSE BACKGROUND ////////////////////////////////////////
	var universeBgObject,
		universeBgTexture,
		universeBgMaterial,
		universeBgGeometry,
		universeBgMesh,
		universeCreated = false;
	function createUniverse(callbackFn) {
		universeBgTexture = new THREE.TextureLoader().load("img/universe.jpg");
		universeBgTexture.anisotropy = 16;
		universeBgGeometry = new THREE.PlaneGeometry(1500, 750, 1, 1);
		universeBgMaterial = new THREE.MeshBasicMaterial({
			map: universeBgTexture,
			blending: THREE.AdditiveBlending,
			color: colorBase,
			transparent: true,
			opacity: 0,
			fog: false,
			side: THREE.DoubleSide,
			depthWrite: false, depthTest: false
		});
		universeBgMesh = new THREE.Mesh( universeBgGeometry, universeBgMaterial );
		universeBgMesh.position.z = -400;
		universeBgMesh.name = 'universeBgMesh';
		scene.add(universeBgMesh);

		universeCreated = true;

		if (callbackFn) {
			callbackFn();
		}
	}



	// EARTH ////////////////////////////////////////
	var globeRadius = 65,
		globeMaxZoom = 90,
		globeMinZoom = 300,
		globeExtraDistance = 0.05,
		globeBufferGeometry,
		globeTexture,
		globeInnerMaterial,
		globeOuterMaterial,
		globeInnerMesh,
		globeOuterMesh,
		globeShieldGeometry,
		globeShieldMaterial,
		globeShieldMesh,
		globeCloud,
		globeCloudVerticesArray = [],
		globeCloudBufferGeometry,
		globeCloudColors,
		globeCloudMaterial,
		globeGlowSize = 200,
		globeGlowTexture,
		globeGlowMaterial,
		globeGlowBufferGeometry,
		globeGlowMesh,
		globeGlowPositionZ = 0,
		globeCreated = false;
	function createGlobe(callbackFn) {

		globeBufferGeometry = new THREE.SphereBufferGeometry(globeRadius, 64, 64);
		globeTexture = new THREE.TextureLoader().load("img/map.png");
		//var maxAnisotropy = renderer.getMaxAnisotropy();
		globeTexture.anisotropy = 16;

		globeInnerMaterial = new THREE.MeshBasicMaterial({
			map: globeTexture,
			color: colorBase75,
			transparent: true,
			blending: THREE.AdditiveBlending,
			side: THREE.BackSide,
			fog: true,
			depthWrite: false, depthTest: false
		});
		globeInnerMaterial.needsUpdate = true;
		globeInnerMesh = new THREE.Mesh(globeBufferGeometry, globeInnerMaterial);
		earthObject.add(globeInnerMesh);

		globeOuterMaterial = new THREE.MeshBasicMaterial({
			map: globeTexture,
			color: colorBase,
			transparent: true,
			blending: THREE.AdditiveBlending,
			side: THREE.FrontSide,
			fog: true,
			depthWrite: false, depthTest: false
		});
		globeOuterMaterial.needsUpdate = true;
		globeOuterMesh = new THREE.Mesh(globeBufferGeometry, globeOuterMaterial);
		earthObject.add(globeOuterMesh);

		// GLOW REFLECTIONS
		globeShieldMaterial = new THREE.MeshPhongMaterial( {
			color: colorBase75,
			transparent: true,
			blending: THREE.AdditiveBlending,
			side: THREE.FrontSide,
			opacity: 0,
			fog: false,
			depthWrite: false, depthTest: false
			//,shading: THREE.FlatShading
		} );
		globeShieldMesh = new THREE.Mesh( globeBufferGeometry, globeShieldMaterial );
		globeShieldMesh.name = 'globeShieldMesh';
		scene.add( globeShieldMesh );

		// MAP PARTICLE FILL
		var img = new Image();
		img.src = "img/map_inverted.png";

		img.onload = function(){
			var canvas = document.createElement("canvas");
			canvas.width = img.width;
			canvas.height = img.height;

			var ctx = canvas.getContext('2d');
			ctx.drawImage(img,0,0,img.width,img.height);

			var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			for(var i=0; i<imageData.data.length; i+=4) {
				var curX = (i / 4) % canvas.width;
				var curY = ((i / 4) - curX) / canvas.width;
				if (((i / 4)) % 2 === 1 && curY % 2 === 1) {
					var color = imageData.data[i];
					if (color === 0) {
						var x = curX;
						var y = curY;
						var lat = (y/(canvas.height/180)-90)/-1;
						var lng = x/(canvas.width/360)-180;
						var position = latLongToVector3(lat, lng, globeRadius, -0.1);
						globeCloudVerticesArray.push(position);
					}
				}
			}

			globeCloudBufferGeometry = new THREE.BufferGeometry();
			var positions = new Float32Array(globeCloudVerticesArray.length * 3);
			for (var i = 0; i < globeCloudVerticesArray.length; i++) {
				positions[i * 3] = globeCloudVerticesArray[i].x;
				positions[i * 3 + 1] = globeCloudVerticesArray[i].y;
				positions[i * 3 + 2] = globeCloudVerticesArray[i].z;
			}
			globeCloudBufferGeometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

			// COLOR CHECKERED
			globeCloudMaterial = new THREE.PointsMaterial( {
				size: 0.75,
				fog: true,
				vertexColors: THREE.VertexColors,
				//transparent: true,
				//blending: THREE.AdditiveBlending,
				depthWrite: false//, depthTest: false
			});

			var colors = new Float32Array(globeCloudVerticesArray.length * 3);
			var globeCloudColors = [];
			for( var i = 0; i < globeCloudVerticesArray.length; i++ ) {
				var tempPercentage = generateRandomNumber( 80, 90 ) * 0.01;
				var shadedColor = shadeBlend(tempPercentage, colorPrimary_Base, colorDarken);
				globeCloudColors[i] = new THREE.Color(shadedColor);
			}
			for (var i = 0; i < globeCloudVerticesArray.length; i++) {
				colors[i * 3] = globeCloudColors[i].r;
				colors[i * 3 + 1] = globeCloudColors[i].g;
				colors[i * 3 + 2] = globeCloudColors[i].b;
			}
			globeCloudBufferGeometry.addAttribute( 'color', new THREE.BufferAttribute(colors, 3));
			globeCloudBufferGeometry.colorsNeedUpdate = true;

			globeCloud = new THREE.Points( globeCloudBufferGeometry, globeCloudMaterial );
			globeCloud.sortParticles = true;
			globeCloud.name = 'globeCloud';
			earthObject.add( globeCloud );
		};

		// EARTH GLOW
		globeGlowSize = 200;
		globeGlowTexture = new THREE.TextureLoader().load("img/earth-glow.jpg");
		globeGlowTexture.anisotropy = 2;

		//globeGlowTexture.anisotropy = maxAnisotropy;
		globeGlowTexture.wrapS = globeGlowTexture.wrapT = THREE.RepeatWrapping;
		globeGlowTexture.magFilter = THREE.NearestFilter;
		globeGlowTexture.minFilter = THREE.NearestMipMapNearestFilter;

		globeGlowBufferGeometry = new THREE.PlaneBufferGeometry(globeGlowSize, globeGlowSize, 1, 1);
		globeGlowMaterial = new THREE.MeshBasicMaterial({
			map: globeGlowTexture,
			color: colorBase,
			transparent: true,
			opacity: 0,
			fog: false,
			blending: THREE.AdditiveBlending,

			depthWrite: false//, depthTest: false
		});
		globeGlowMesh = new THREE.Mesh( globeGlowBufferGeometry, globeGlowMaterial );
		globeGlowMesh.name = 'globeGlowMesh';
		scene.add(globeGlowMesh);

		globeCreated = true;

		if (callbackFn) {
			callbackFn();
		}
	}

	function renderGlobe() {
		if (isGlobeEventsEnabled) {
			// ZOOM LEVEL
			if (targetCameraZ < globeMaxZoom) targetCameraZ = globeMaxZoom;
			if (targetCameraZ > globeMinZoom) targetCameraZ = globeMinZoom;
			camera.position.z = camera.position.z += ( targetCameraZ - camera.position.z ) * 0.01;

			// MOVE DAT GLOW MESH
			var cameraThresholdZ = 200;
			var tempCameraZ = camera.position.z;
			if (tempCameraZ < cameraThresholdZ && tempCameraZ > globeMaxZoom) {
				var tempDifference = cameraThresholdZ - globeMaxZoom;
				var tempPosition = (cameraThresholdZ - tempCameraZ) / tempDifference;
				globeGlowPositionZ = 0 + (tempPosition * 22);
			} else {
				globeGlowPositionZ = 0;
			}
			globeCloud.sortParticles = true;
			globeGlowMesh.position.set( 0, 0, globeGlowPositionZ );
		}
	}

	function showGlobe() {
		TweenMax.fromTo( universeBgMaterial, 4, { opacity: 0 }, { opacity: 1, delay: 1, ease: Linear.easeNone } );
		TweenMax.fromTo( globeShieldMaterial, 3, { opacity: 0 }, { opacity: 0.65, delay: 1, ease: Linear.easeNone } );
		TweenMax.fromTo( globeGlowMaterial, 3, { opacity: 0 }, { opacity: 1, delay: 1, ease: Linear.easeNone } );
		TweenMax.fromTo( starsZoomObject.position, 6, { z: 0 }, { z: 325, ease: Circ.easeInOut,
			onComplete:function(){
				starsZoomObject.visible = false;
			}
		});
	}



	// MAP DOTS ////////////////////////////////////////
	var dotObject,
		dotTexture,
		dotMaterial,
		dotSpritesArray = [],
		dotDetailsArray = [],

		dotHoverTexture,
		dotHoverMaterial,
		dotSpritesHoverArray = [],

		dotSpikesVerticesArray = [],
		dotSpikesBufferGeometry,
		dotSpikesMaterial,
		dotSpikesMesh,

		dotSpikeHoverGeometry,
		dotSpikeHoverMaterial,
		dotSpikeHover,

		dotSpikesCloudVerticesArray = [],

		dotsCreated = false;

	function createDots(callbackFn) {
		dotObject = new THREE.Group();
		dotObject.name = 'dotObject';
		earthObject.add( dotObject );

		dotTexture = new THREE.TextureLoader().load("img/dot-inverted.png");
		dotMaterial = new THREE.MeshBasicMaterial( {
			map: dotTexture,
			color: colorHighlight,
			transparent: true,
			blending: THREE.AdditiveBlending,
			side: THREE.DoubleSide,
			fog: true,
			depthWrite: false//, depthTest: false
		});

		for ( i = 0; i < dataMap.length; i ++ ) {
			var bookType = dataMap[i][1];
            var x = dataMap[i][2];
            var y = dataMap[i][3];

			var dotGeometry = new THREE.PlaneBufferGeometry( 1, 1, 1 );

			var dotSprite = new THREE.Mesh( dotGeometry, dotMaterial );
			dotSprite.userData = {id: i };

 			//var randomExtra = (Math.floor(Math.random() * 100) + 1) * 0.0001;
 			var randomExtra = 0.1;
			if (bookType === 2) randomExtra = randomExtra + 0.05;
            var dotPosition = latLongToVector3(x, y, globeRadius, globeExtraDistance + randomExtra );
			dotSprite.position.set( dotPosition.x, dotPosition.y, dotPosition.z );
			dotSprite.lookAt(new THREE.Vector3(0, 0, 0));

			var dotSize = 2;
			if (bookType === 2) dotSize = 3;
			dotSprite.scale.set( dotSize, dotSize, dotSize );

			dotDetailsArray.push({
				position: new THREE.Vector3(dotSprite.position.x, dotSprite.position.y, dotSprite.position.z),
				type: bookType
			});

			dotSpritesArray.push( dotSprite );
			dotObject.add( dotSprite );

			// ADD THE HOVERS
			var dotHoverMaterial = new THREE.MeshBasicMaterial( {
				map: dotTexture,
				color: colorHighlight,
				transparent: true,
				blending: THREE.AdditiveBlending,
				side: THREE.DoubleSide,
				opacity: 0,
				depthWrite: false//, depthTest: false
			});
			var dotHoverSprite = new THREE.Mesh( dotGeometry, dotHoverMaterial );
            var dotPosition = latLongToVector3(x, y, globeRadius, globeExtraDistance + randomExtra );
			dotHoverSprite.position.set( dotPosition.x, dotPosition.y, dotPosition.z );
			dotHoverSprite.lookAt(new THREE.Vector3(0, 0, 0));
			dotHoverSprite.visible = false;

			dotSpritesHoverArray.push( dotHoverSprite );
			dotObject.add( dotHoverSprite );
		}

		// DOT SPIKES
		for ( i = 0; i < dotDetailsArray.length; i ++ ) {
			var vertex1 = new THREE.Vector3();
			vertex1.x = dotSpritesArray[i].position.x;
			vertex1.y = dotSpritesArray[i].position.y;
			vertex1.z = dotSpritesArray[i].position.z;
			var vertex2 = vertex1.clone();
			var tempScalar = (Math.random() * 4) * 0.01;

			if ( dotDetailsArray[i].type === 2 ) {
				vertex2.multiplyScalar( 1.12 );
			}
			if ( dotDetailsArray[i].type === 1 ) {
				vertex2.multiplyScalar( 1.02 + tempScalar );
			}
			if ( dotDetailsArray[i].type === 0 ) {
				vertex2.multiplyScalar( 1.02 + tempScalar );
			}
			dotSpikesVerticesArray.push( vertex1 );
			dotSpikesVerticesArray.push( vertex2 );
			dotSpikesCloudVerticesArray.push( vertex2 );
		}

		var positions = new Float32Array( dotSpikesVerticesArray.length * 3 );
		for (var i = 0; i < dotSpikesVerticesArray.length; i++) {
			positions[i * 3] = dotSpikesVerticesArray[i].x;
			positions[i * 3 + 1] = dotSpikesVerticesArray[i].y;
			positions[i * 3 + 2] = dotSpikesVerticesArray[i].z;
		}

		dotSpikesMaterial = new THREE.LineBasicMaterial( {
			linewidth: 1,
			color: colorHighlight,
			transparent: true,
			blending: THREE.AdditiveBlending,
			fog: true,
			depthWrite: false
		});

		dotSpikesBufferGeometry = new THREE.BufferGeometry();
		dotSpikesBufferGeometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		dotSpikesMesh = new THREE.LineSegments( dotSpikesBufferGeometry, dotSpikesMaterial );
		dotObject.add( dotSpikesMesh );

		// DOT SPIKE EXTRAS
		var tempArray = [];
		for ( i = 0; i < dotSpikesCloudVerticesArray.length; i ++ ) {
			var vertex1 = new THREE.Vector3();
			vertex1 = dotSpikesCloudVerticesArray[i];
			var vertex2 = vertex1.clone();
			vertex2.multiplyScalar( 1.0025 );
			tempArray.push( vertex1 );
			tempArray.push( vertex2 );
		}

		var positions = new Float32Array( tempArray.length * 3 );
		for (var i = 0; i < tempArray.length; i++) {
			positions[i * 3] = tempArray[i].x;
			positions[i * 3 + 1] = tempArray[i].y;
			positions[i * 3 + 2] = tempArray[i].z;
		}

		dotSpikesExtraMaterial = new THREE.LineBasicMaterial( {
			linewidth: 1,
			color: 0xFFFFFF, //colorBase, //new THREE.Color(shadeBlend(0.5, colorSecondary_Base, colorBrighten)),
			transparent: true,
			blending: THREE.AdditiveBlending,
			//opacity: 0.5,
			fog: true,
			depthWrite: false
		});

		dotSpikesExtraBufferGeometry = new THREE.BufferGeometry();
		dotSpikesExtraBufferGeometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		dotSpikesExtraMesh = new THREE.LineSegments( dotSpikesExtraBufferGeometry, dotSpikesExtraMaterial );
		dotObject.add( dotSpikesExtraMesh );

		dotsCreated = true;

		if (callbackFn) {
			callbackFn();
		}
	}

	function renderDots() {
		// RESIZE DOTS
		var cameraThresholdZ = 200;
		var tempCameraZ = camera.position.z;
		var dotScale = 0;
		if (tempCameraZ < cameraThresholdZ && tempCameraZ > globeMaxZoom) {
			var tempDifference = cameraThresholdZ - globeMaxZoom;
			var tempScale = (cameraThresholdZ - tempCameraZ) / tempDifference;
			dotScale = tempScale * 1.25;
		}
		for ( i = 0; i < dotDetailsArray.length; i ++ ) {
			var baseScale = 2;
			if (dotDetailsArray[i].type === 2) baseScale = 3;
			dotSpritesArray[i].scale.set( baseScale - dotScale, baseScale - dotScale, 1 );
		}
	}




	// MEDIA ICONS DOTS ////////////////////////////////////////
	var mediaObject,
		mediaTexture,
		mediaMaterial,
		mediaSpritesArray = [],
		mediaDetailsArray = [],
		mediaCloud,
		mediaVerticesArray = [],
		mediaCreated = false;
	function createMedia(callbackFn) {
		mediaObject = new THREE.Group();
		mediaObject.name = 'mediaObject';
		earthObject.add( mediaObject );

		// POINT CLOUD GEOMETRY
		/*for ( i = 0; i < dataMedia.length; i ++ ) {
			var mediaType = dataMedia[i][0];
            var x = dataMedia[i][2];
            var y = dataMedia[i][3];

 			var randomExtra = (Math.floor(Math.random() * 20) + 1) * 0.1;

            var mediaPosition = latLongToVector3(x, y, globeRadius, globeExtraDistance + 8 + randomExtra );
			mediaVerticesArray.push( mediaPosition );

			mediaDetailsArray.push({
				position: new THREE.Vector3(mediaPosition.x, mediaPosition.y, mediaPosition.z),
				type: mediaType
			});
		} */

		mediaTexture = new THREE.TextureLoader().load("img/photo.png");
		mediaMaterial = new THREE.PointsMaterial( {
			map: mediaTexture,
			size: 0,
			transparent: true,
			blending: THREE.AdditiveBlending,
			color: 0xFFFFFF,
			depthWrite: false//, depthTest: false
		});
		mediaMaterial.needsUpdate = true;

		var positions = new Float32Array(mediaVerticesArray.length * 3);
		for (var i = 0; i < mediaVerticesArray.length; i++) {
			positions[i * 3] = mediaVerticesArray[i].x;
			positions[i * 3 + 1] = mediaVerticesArray[i].y;
			positions[i * 3 + 2] = mediaVerticesArray[i].z;
		}

		mediaBufferGeometry = new THREE.BufferGeometry();
		mediaBufferGeometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

		mediaCloud = new THREE.Points( mediaBufferGeometry, mediaMaterial );
		mediaCloud.sortParticles = true;
		mediaObject.add( mediaCloud );

		mediaCreated = true;

		if (callbackFn) {
			callbackFn();
		}
	}

	function renderMedia() {
		// RESIZE DOTS
		var cameraThresholdZ = 200;
		var tempCameraZ = camera.position.z;
		var dotScale = 0;
		if (tempCameraZ < cameraThresholdZ && tempCameraZ > globeMaxZoom) {
			var tempDifference = cameraThresholdZ - globeMaxZoom;
			var tempScale = (cameraThresholdZ - tempCameraZ) / tempDifference;
			mediaMaterial.size = 1.25 * tempScale;
			mediaMaterial.needsUpdate = true;
		}
	}





	// STARS ////////////////////////////////////////
	var starsObject1,
		starsObject2,
		starsObjectZoom,
		starsCenter = new THREE.Vector3(0, 0, 0),
		starsCloud1,
		starsCloud2,
		starsTotal = 500,
		starsMaxDistance = 400, //globeMinZoom + 100,
		starsMinDistance = 100, //globeMinZoom + 25,
		starsVerticesArray = [],
		starsMaterial,
		starsSize = 1,

		starsZoomObject,
		starZoomTexture,
		starsZoomTotal = 150,
		starsZoomMaxDistance = 200,
		starsZoomBuffer = 0, //globeMinZoom + 10,
		starsZoomVerticesArray = [],
		starsZoomMaterial,
		starsZoomBufferGeometry,

		starsCreated = false;

	function createStars(callbackFn) {
		starsObject1 = new THREE.Group();
		starsObject1.name = 'starsObject1';
		scene.add( starsObject1 );

		starsObject2 = new THREE.Group();
		starsObject2.name = 'starsObject2';
		scene.add( starsObject2 );

		// POINT CLOUD GEOMETRY
		for ( i = 0; i < starsTotal; i ++ ) {
			var vertex = new THREE.Vector3();
			vertex.x = Math.random() * starsMaxDistance - starsMaxDistance/2;
			vertex.y = Math.random() * 150 - 150/2;
			vertex.z = Math.random() * starsMaxDistance - starsMaxDistance/2;
			var tempDifference = checkDistance(starsCenter, vertex);
			var tempBuffer = starsMinDistance;
			if (tempDifference < tempBuffer) {
				if (vertex.x < tempBuffer) vertex.x = tempBuffer;
				if (vertex.y < tempBuffer) vertex.y = tempBuffer;
				if (vertex.z < tempBuffer) vertex.z = tempBuffer;
			}
			starsVerticesArray.push( vertex );
		}

		starsMaterial = new THREE.PointsMaterial({
			//map: starTexture,
			//transparent: true,
			//blending: THREE.AdditiveBlending,
			size: starsSize,
			sizeAttenuation: false,
			color: colorBase,
			fog: true
		});
		starsMaterial.needsUpdate = true;

		var positions = new Float32Array(starsVerticesArray.length * 3);
		for (var i = 0; i < starsVerticesArray.length; i++) {
			positions[i * 3] = starsVerticesArray[i].x;
			positions[i * 3 + 1] = starsVerticesArray[i].y;
			positions[i * 3 + 2] = starsVerticesArray[i].z;
		}

		starsBufferGeometry = new THREE.BufferGeometry();
		starsBufferGeometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

		starsCloud1 = new THREE.Points( starsBufferGeometry, starsMaterial );
		starsCloud1.sortParticles = true;
		starsObject1.add( starsCloud1 );

		starsCloud2 = new THREE.Points( starsBufferGeometry, starsMaterial );
		starsCloud2.sortParticles = true;
		starsObject2.add( starsCloud2 );
		starsObject2.rotation.x = 180 * toRAD;



		// STAR ZOOM FIELD
		starsZoomObject = new THREE.Group();
		starsZoomObject.name = 'starsObjectZoom';
		scene.add( starsZoomObject );

		//starZoomTexture = new THREE.TextureLoader().load("img/dot-inverted.png");
		starZoomTexture = new THREE.TextureLoader().load("img/star.jpg");

		// POINT CLOUD GEOMETRY
		for ( i = 0; i < starsZoomTotal; i ++ ) {
			var vertex = new THREE.Vector3();
			vertex.x = Math.random() * starsZoomMaxDistance - starsZoomMaxDistance/2;
			vertex.y = Math.random() * starsZoomMaxDistance - starsZoomMaxDistance/2;
			vertex.z = starsZoomBuffer + Math.random() * 500; //starsZoomMaxDistance - starsZoomMaxDistance/2;
			starsZoomVerticesArray.push( vertex );
		}

		starsZoomMaterial = new THREE.PointsMaterial({
			map: starZoomTexture,
			transparent: true,
			blending: THREE.AdditiveBlending,
			size: 5,
			color: colorBase,
			fog: true
		});

		var positions = new Float32Array(starsZoomVerticesArray.length * 3);
		for (var i = 0; i < starsZoomVerticesArray.length; i++) {
			positions[i * 3] = starsZoomVerticesArray[i].x;
			positions[i * 3 + 1] = starsZoomVerticesArray[i].y;
			positions[i * 3 + 2] = starsZoomVerticesArray[i].z;
		}

		starsZoomBufferGeometry = new THREE.BufferGeometry();
		starsZoomBufferGeometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

		starsZoomCloud = new THREE.Points( starsZoomBufferGeometry, starsZoomMaterial );
		starsZoomCloud.sortParticles = true;
		starsZoomObject.add( starsZoomCloud );

		starsCreated = true;

		if (callbackFn) {
			callbackFn();
		}
	}

	function renderStars() {
		starsObject1.rotation.y += 0.00025;
		starsObject2.rotation.y += 0.00025;
	}




	// ARCS ////////////////////////////////////////
	var lineBufferSpeed = 0.025;
	var lineBufferDivisions = 25;
	var snakeBufferSpeed = (lineBufferSpeed * lineBufferDivisions) * 3;

	var arcRocketObject,
		arcRocketDetailsArray = [],
		arcRocketVerticesArray = [],
		arcRocketBufferGeometry,
		arcRocketShaderUniforms,
		arcRocketShaderMaterial,
		arcRocketMesh,
		arcRocketAnimation,
		arcRocketCreated = false;
	function createArcsRocket(callbackFn) {
		arcRocketObject = new THREE.Group();
		arcRocketObject.name = 'arcsRocket';

		for ( i = 0; i < dataMap.length-1; i ++ ) {
			var p1 = latLongToVector3(dataMap[0][2], dataMap[0][3], globeRadius, globeExtraDistance);
			var p4 = latLongToVector3(dataMap[i+1][2], dataMap[i+1][3], globeRadius, globeExtraDistance);

			var tempArcHeightMid = 1 + (checkDistance(p1,p4) * 0.006);
			var pMid = new THREE.Vector3();
			pMid.addVectors( p1, p4 );
			pMid.normalize().multiplyScalar(globeRadius * tempArcHeightMid);

			var tempArcHeight = 1 + (checkDistance(p1,pMid) * 0.006);

			var p2 = new THREE.Vector3();
			p2.addVectors( p1, pMid );
			p2.normalize().multiplyScalar(globeRadius * tempArcHeight);

			var p3 = new THREE.Vector3();
			p3.addVectors( pMid, p4 );
			p3.normalize().multiplyScalar(globeRadius * tempArcHeight);

			var curve = new THREE.CubicBezierCurve3( p1, p2, p3, p4 );
			var curveVertices = curve.getPoints( lineBufferDivisions );
			for (var j = 0; j < lineBufferDivisions; j++) {
				arcRocketVerticesArray.push(curveVertices[j]);
				arcRocketDetailsArray.push({
					alpha: 0
				});
				arcRocketVerticesArray.push(curveVertices[j+1]);
				arcRocketDetailsArray.push({
					alpha: 0
				});
			}
		}

		// BUFFER VERSION
		arcRocketBufferGeometry = new THREE.BufferGeometry();
		arcRocketShaderUniforms = {
			color:     { value: colorHighlight },
			fogColor:    { type: "c", value: scene.fog.color },
			fogNear:     { type: "f", value: scene.fog.near },
			fogFar:      { type: "f", value: scene.fog.far }
		};
		arcRocketShaderMaterial = new THREE.ShaderMaterial( {
			uniforms:       arcRocketShaderUniforms,
			vertexShader:   document.getElementById( 'line_vertexshader' ).textContent,
			fragmentShader: document.getElementById( 'line_fragmentshader' ).textContent,
			blending:       THREE.AdditiveBlending,
			depthTest:      false,
        	fog: true,
			transparent:    true
		});

		var positions = new Float32Array(arcRocketVerticesArray.length * 3);
		var alphas = new Float32Array( arcRocketVerticesArray.length );

		for (var i = 0; i < arcRocketVerticesArray.length; i++) {
			positions[i * 3] = arcRocketVerticesArray[i].x;
			positions[i * 3 + 1] = arcRocketVerticesArray[i].y;
			positions[i * 3 + 2] = arcRocketVerticesArray[i].z;
			alphas[ i ] = 0;
		}

		arcRocketBufferGeometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		arcRocketBufferGeometry.addAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );
		arcRocketMesh = new THREE.LineSegments( arcRocketBufferGeometry, arcRocketShaderMaterial );
		arcRocketObject.add( arcRocketMesh );
		arcRocketObject.visible = false;
		arcRocketCreated = true;

		// ARC ROCKET ANIMATION
		arcRocketAnimation =  new TimelineMax({ paused: true, repeat: -1,
			onUpdate:function(){
				renderArcsRocket()
			}
		});

		arcRocketAnimation.staggerTo( arcRocketDetailsArray, 0.25, { alpha: 0 }, 0.025, 2 );
		arcRocketAnimation.staggerFromTo( arcRocketDetailsArray, 0.25, { alpha: 0 }, { alpha: 1 }, 0.025, 0 );
		arcRocketAnimation.timeScale(2);

		if (callbackFn) {
			callbackFn();
		}
	}

	function renderArcsRocket() {
		if (!arcRocketCreated) return;
		var attributes = arcRocketBufferGeometry.attributes;
		for ( var i = 0; i < arcRocketDetailsArray.length; i ++ ) {
			var pd = arcRocketDetailsArray[i];
			attributes.alpha.array[ i ] = pd.alpha;
		}
		attributes.alpha.needsUpdate = true;
	}




	var arcSnakeObject,
		arcSnakeDetailsArray = [],
		arcSnakeVerticesArray = [],
		arcSnakeBufferGeometry,
		arcSnakeShaderUniforms,
		arcSnakeShaderMaterial,
		arcSnakeMesh,
		arcSnakeAnimation,
		arcSnakeCreated = false;
	function createArcsSnake(callbackFn) {
		arcSnakeObject = new THREE.Group();
		arcSnakeObject.name = 'arcsSnake';

		for ( i = 0; i < dataMap.length-1; i ++ ) {
			var p1 = latLongToVector3(dataMap[i][2], dataMap[i][3], globeRadius, globeExtraDistance);
			var p4 = latLongToVector3(dataMap[i+1][2], dataMap[i+1][3], globeRadius, globeExtraDistance);

			var tempArcHeightMid = 1 + (checkDistance(p1,p4) * 0.0065);
			var pMid = new THREE.Vector3();
			pMid.addVectors( p1, p4 );
			pMid.normalize().multiplyScalar(globeRadius * tempArcHeightMid);

			var tempArcHeight = 1 + (checkDistance(p1,pMid) * 0.0065);
			var p2 = new THREE.Vector3();
			p2.addVectors( p1, pMid );
			p2.normalize().multiplyScalar(globeRadius * tempArcHeight);

			var p3 = new THREE.Vector3();
			p3.addVectors( pMid, p4 );
			p3.normalize().multiplyScalar(globeRadius * tempArcHeight);

			var curve = new THREE.CubicBezierCurve3( p1, p2, p3, p4 );
			var curveVertices = curve.getPoints( lineBufferDivisions );
			for (var j = 0; j < lineBufferDivisions; j++) {
				arcSnakeVerticesArray.push(curveVertices[j]);
				arcSnakeDetailsArray.push({
					alpha: 0
				});
			}
		}

		// BUFFER VERSION
		arcSnakeBufferGeometry = new THREE.BufferGeometry();
		arcSnakeShaderUniforms = {
			color:	     { value: colorHighlight },
			fogColor:    { type: "c", value: scene.fog.color },
			fogNear:     { type: "f", value: scene.fog.near },
			fogFar:      { type: "f", value: scene.fog.far }
		};
		arcSnakeShaderMaterial = new THREE.ShaderMaterial( {
			uniforms:       arcSnakeShaderUniforms,
			vertexShader:   document.getElementById( 'line_vertexshader' ).textContent,
			fragmentShader: document.getElementById( 'line_fragmentshader' ).textContent,
			blending:       THREE.AdditiveBlending,
			depthTest:      false,
        	fog: true,
			transparent:    true
		});

		var positions = new Float32Array(arcSnakeVerticesArray.length * 3);
		var alphas = new Float32Array( arcSnakeVerticesArray.length );

		for (var i = 0; i < arcSnakeVerticesArray.length; i++) {
			positions[i * 3] = arcSnakeVerticesArray[i].x;
			positions[i * 3 + 1] = arcSnakeVerticesArray[i].y;
			positions[i * 3 + 2] = arcSnakeVerticesArray[i].z;
			alphas[ i ] = 0;
		}

		arcSnakeBufferGeometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		arcSnakeBufferGeometry.addAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );
		arcSnakeMesh = new THREE.Line( arcSnakeBufferGeometry, arcSnakeShaderMaterial );
		arcSnakeObject.add( arcSnakeMesh );
		earthObject.add( arcSnakeObject );
		//arcSnakeObject.visible = false;
		arcSnakeCreated = true;

		// ARC SNAKE ANIMATION
		arcSnakeAnimation =  new TimelineMax({ paused: true, delay: 2, repeat: -1,
			onUpdate:function(){
				renderArcsSnake();
			}
		});

		for ( i = 0; i < dotSpritesHoverArray.length; i++ ) {
			var tempTarget = dotSpritesHoverArray[i];
			arcSnakeAnimation.fromTo( tempTarget.scale, 1, { x: 2, y: 2 }, { x: 10, y: 10, ease: Expo.easeOut }, (lineBufferDivisions * 0.025) * i);
			arcSnakeAnimation.fromTo( tempTarget.material, 1.5, { opacity: 1 }, { opacity: 0 }, (lineBufferDivisions * 0.025) * i);
			arcSnakeAnimation.fromTo( tempTarget, 1.5, {  }, {
				onStart:function(){
					this.target.visible = true;
				},
				onComplete:function(){
					this.target.visible = false;
				}
			}, (lineBufferDivisions * 0.025) * i);
		}

		arcSnakeAnimation.staggerTo( arcSnakeDetailsArray, 0.25, { alpha: 0 }, 0.025, 2 );
		arcSnakeAnimation.staggerFromTo( arcSnakeDetailsArray, 0.25, { alpha: 0 }, { alpha: 1 }, 0.025, 0 );
		//arcSnakeAnimation.timeScale(2);

		if (callbackFn) {
			callbackFn();
		}
	}

	function renderArcsSnake() {
		if (!arcSnakeCreated) return;
		var attributes = arcSnakeBufferGeometry.attributes;
		for ( var i = 0; i < arcSnakeDetailsArray.length; i++ ) {
			var pd = arcSnakeDetailsArray[i];
			attributes.alpha.array[ i ] = pd.alpha;
		}
		attributes.alpha.needsUpdate = true;
	}

	var arcAllObject,
		arcAllsVerticesArray = [],
		arcAllBufferGeometry,
		arcAllMaterial,
		arcAllMesh,
		arcAllAnimation,
		arcAllCreated = false;
	function createArcsAll(callbackFn) {
		arcAllObject = new THREE.Group();
		arcAllObject.name = 'arcsAll';

		for ( i = 0; i < dataMap.length-1; i ++ ) {
			var p1 = latLongToVector3(dataMap[0][2], dataMap[0][3], globeRadius, globeExtraDistance);
			var p4 = latLongToVector3(dataMap[i+1][2], dataMap[i+1][3], globeRadius, globeExtraDistance);

			var tempArcHeightMid = 1 + (checkDistance(p1,p4) * 0.005);
			var pMid = new THREE.Vector3();
			pMid.addVectors( p1, p4 );
			pMid.normalize().multiplyScalar(globeRadius * tempArcHeightMid);

			var tempArcHeight = 1 + (checkDistance(p1,pMid) * 0.005);
			var p2 = new THREE.Vector3();
			p2.addVectors( p1, pMid );
			p2.normalize().multiplyScalar(globeRadius * tempArcHeight);

			var p3 = new THREE.Vector3();
			p3.addVectors( pMid, p4 );
			p3.normalize().multiplyScalar(globeRadius * tempArcHeight);

			var curve = new THREE.CubicBezierCurve3( p1, p2, p3, p4 );
			var curveVertices = curve.getPoints( lineBufferDivisions );
			for (var j = 0; j < lineBufferDivisions; j++) {
				arcAllsVerticesArray.push(curveVertices[j]);
				arcAllsVerticesArray.push(curveVertices[j+1]);
			}
		}

		arcAllMaterial = new THREE.LineBasicMaterial( {
			linewidth: 1,
			color : colorHighlight,
			transparent: true,
			blending: THREE.AdditiveBlending,
			fog: true,
			depthWrite: false//, depthTest: false
		});

		var positions = new Float32Array(arcAllsVerticesArray.length * 3);
		for (var i = 0; i < arcAllsVerticesArray.length; i++) {
			positions[i * 3] = arcAllsVerticesArray[i].x;
			positions[i * 3 + 1] = arcAllsVerticesArray[i].y;
			positions[i * 3 + 2] = arcAllsVerticesArray[i].z;
		}

		arcAllBufferGeometry = new THREE.BufferGeometry();
		arcAllBufferGeometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		arcAllMesh = new THREE.LineSegments( arcAllBufferGeometry, arcAllMaterial );
		arcAllObject.add( arcAllMesh );
		arcAllObject.visible = false;

		// ARC ALL ANIMATION
		arcAllAnimation =  new TimelineMax({ paused: true });
		arcAllAnimation.fromTo( arcAllMesh.material, 2, { opacity: 0 }, { opacity: 1 }, 0);
		arcAllAnimation.timeScale(1);

		arcAllCreated = true;

		if (callbackFn) {
			callbackFn();
		}
	}


	// SPIKES ////////////////////////////////////////
	var spikesObject,
		spikeRadius = globeRadius + 30,
		spikesVerticesArray = [],
		spikesBufferGeometry,
		spikesMaterial,
		spikesMesh,
		spikesCreated = false;
	function createSpikes(callbackFn) {
		spikesObject = new THREE.Group();
		spikesObject.name = 'spikesObject';
		rotationObject.add( spikesObject );

		// SPHERE SPIKES
		var sphereSpikeRadius = globeRadius + 40,
			sphereGeometry = new THREE.SphereGeometry( sphereSpikeRadius, 8, 4 );
			//sphereGeometry.rotation.y = 25 * toRAD;
			sphereGeometry.mergeVertices();

		for ( i = 0; i < sphereGeometry.vertices.length; i ++ ) {
			var vertex1 = new THREE.Vector3();
			vertex1.x = sphereGeometry.vertices[i].x;
			vertex1.y = sphereGeometry.vertices[i].y;
			vertex1.z = sphereGeometry.vertices[i].z;
			vertex1.normalize();
			vertex1.multiplyScalar( sphereSpikeRadius );
			var vertex2 = vertex1.clone();
			vertex2.multiplyScalar( 1.03 );
			spikesVerticesArray.push( vertex1 );
			spikesVerticesArray.push( vertex2 );
		}

		// FLAT SPIKE RING
		var spikeTotal = 400;
		var spikeAngle = 2 * Math.PI / spikeTotal;
		for ( i = 0; i < spikeTotal; i ++ ) {
			var vertex1 = new THREE.Vector3();
			vertex1.x = spikeRadius * Math.cos(spikeAngle * i);
			vertex1.y = 0;
			vertex1.z = spikeRadius * Math.sin(spikeAngle * i);
			vertex1.normalize();
			vertex1.multiplyScalar( spikeRadius );
			var vertex2 = vertex1.clone();
			if (i % 10 === 1) {
				vertex2.multiplyScalar( 1.02 );
			} else {
				vertex2.multiplyScalar( 1.01 );
			}
			spikesVerticesArray.push( vertex1 );
			spikesVerticesArray.push( vertex2 );
		}

		var positions = new Float32Array(spikesVerticesArray.length * 3);
		for (var i = 0; i < spikesVerticesArray.length; i++) {
			positions[i * 3] = spikesVerticesArray[i].x;
			positions[i * 3 + 1] = spikesVerticesArray[i].y;
			positions[i * 3 + 2] = spikesVerticesArray[i].z;
		}

		spikesMaterial = new THREE.LineBasicMaterial( {
			linewidth: 1,
			color: colorBase50,
			transparent: true,
			blending: THREE.AdditiveBlending,
			side: THREE.DoubleSide,
			fog: true,
			depthWrite: false//, depthTest: false
		});

		spikesBufferGeometry = new THREE.BufferGeometry();
		spikesBufferGeometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		spikesMesh = new THREE.LineSegments( spikesBufferGeometry, spikesMaterial );
		spikesObject.add( spikesMesh );

		spikesCreated = true;

		if (callbackFn) {
			callbackFn();
		}
	}



	// RING PULSE ////////////////////////////////////////
	var ringPulseObject,
		ringPulseTotal = 250,
		ringPulseTotalHalf = ringPulseTotal/2,
		ringPulseAngle = 2 * Math.PI / ringPulseTotal,
		ringPulseRadius = globeRadius + 25,
		ringPulseVerticesArray = [],
		ringPulseBufferGeometry,
		ringPulsetShaderUniforms,
		ringPulseShaderMaterial,
		ringPulseMesh,
		ringExplosionSize = 100,
		ringExplosionTexture,
		ringExplosionMaterial,
		ringExplosionBufferGeometry,
		ringExplosionMesh,
		ringPointRadius = globeRadius + 20,
		ringPointTotal = 250,
		ringPointAngle = 2 * Math.PI / ringPointTotal,
		ringPointSize = 0.5,
		ringPointGeometry,
		ringPointMaterial,
		ringPointMesh,
		ringPulseCreated = false;
	function createRingPulse(callbackFn) {
		ringPulseObject = new THREE.Group();
		ringPulseObject.name = 'ringPulse';

		for ( i = 0; i < ringPulseTotal; i ++ ) {
			var vertex = new THREE.Vector3();
			vertex.x = ringPulseRadius * Math.cos(ringPulseAngle * i);
			vertex.y = 0;
			vertex.z = ringPulseRadius * Math.sin(ringPulseAngle * i);
			vertex.normalize();
			vertex.multiplyScalar( ringPulseRadius );
			ringPulseVerticesArray.push(vertex);
		}

		ringPulseBufferGeometry = new THREE.BufferGeometry();
		ringPulseShaderUniforms = {
			color:     { value: colorBase },
			fogColor:    { type: "c", value: scene.fog.color },
			fogNear:     { type: "f", value: scene.fog.near },
			fogFar:      { type: "f", value: scene.fog.far }
		};
		ringPulseShaderMaterial = new THREE.ShaderMaterial( {
			uniforms:       ringPulseShaderUniforms,
			vertexShader:   document.getElementById( 'line_vertexshader' ).textContent,
			fragmentShader: document.getElementById( 'line_fragmentshader' ).textContent,
			blending:       THREE.AdditiveBlending,
			depthTest:      false,
        	fog: true,
			transparent:    true
		});

		var positions = new Float32Array(ringPulseVerticesArray.length * 3);
		var alphas = new Float32Array( ringPulseVerticesArray.length );

		var maxOpacity = 0.5;
		for (var i = 0; i < ringPulseVerticesArray.length; i++) {
			positions[i * 3] = ringPulseVerticesArray[i].x;
			positions[i * 3 + 1] = ringPulseVerticesArray[i].y;
			positions[i * 3 + 2] = ringPulseVerticesArray[i].z;

			var tempOpacity = 0;
			var tempHalfOpacity = ringPulseTotalHalf/2;
			if ( i < ringPulseTotalHalf ) {
				if (i < tempHalfOpacity) {
					tempOpacity = (i / tempHalfOpacity) * maxOpacity; // FADE UP
				} else {
					tempOpacity = 1 - ((i / tempHalfOpacity) * maxOpacity); // FADE DOWN
				}
			}
			alphas[ i ] = tempOpacity;
		}

		ringPulseBufferGeometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		ringPulseBufferGeometry.addAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );
		ringPulseMesh = new THREE.LineLoop( ringPulseBufferGeometry, ringPulseShaderMaterial );
		ringPulseObject.add( ringPulseMesh );
		rotationObject.add( ringPulseObject );

		// EARTH EXPLOSION RING
		ringExplosionTexture = new THREE.TextureLoader().load("img/ring_explosion.jpg");
		ringExplosionBufferGeometry = new THREE.PlaneBufferGeometry(ringExplosionSize, ringExplosionSize, 1, 1);
		ringExplosionMaterial = new THREE.MeshBasicMaterial({
			map: ringExplosionTexture,
			color: colorBase85,
			transparent: true,
			blending: THREE.AdditiveBlending,
			side: THREE.DoubleSide,
			depthWrite: false//, depthTest: false
		});
		ringExplosionMesh = new THREE.Mesh( ringExplosionBufferGeometry, ringExplosionMaterial );
		ringExplosionMesh.rotation.x = 90 * toRAD;
		ringExplosionMesh.name = 'ringExplosionMesh';
		ringExplosionMesh.visible = false;
		rotationObject.add(ringExplosionMesh);



		// ADD POINT CLOUD RING
		ringPointGeometry = new THREE.Geometry();
		for ( i = 0; i < ringPointTotal; i ++ ) {
			var vertex = new THREE.Vector3();
			vertex.x = ringPointRadius * Math.cos(ringPointAngle * i);
			vertex.y = 0;
			vertex.z = ringPointRadius * Math.sin(ringPointAngle * i);
			ringPointGeometry.vertices.push( vertex );
		}

		ringPointMaterial = new THREE.PointsMaterial( {
			size: ringPointSize,
			color: colorBase75,
			transparent: true,
			blending: THREE.AdditiveBlending,
			side: THREE.DoubleSide,
			depthWrite: false//, depthTest: false
		});
		ringPointMesh = new THREE.Points( ringPointGeometry, ringPointMaterial );
		ringPointMesh.sortParticles = true;
		rotationObject.add( ringPointMesh );

		ringPulseCreated = true;

		if (callbackFn) {
			callbackFn();
		}
	}

	function renderRingPulse() {
		ringPulseObject.rotation.y += 0.025;
	}



	// GYROSCOPE  ////////////////////////////////////////
	var gyroscopeObject,
		gyroscopeGeometry,
		gyroscopeRingSize = globeRadius + 25,
		gyroscopeRingThickness = gyroscopeRingSize - 1,
		gyroscopeMaterial,
		gyroscopeMesh1,
		gyroscopeMesh2,
		gyroscopeMesh3,
		gyroscopeMesh4,
		gyroscopeCreated = false;
	function createGyroscope(callbackFn) {
		gyroscopeObject = new THREE.Object3D();
		rotationObject.add( gyroscopeObject );

		gyroscopeGeometry = new THREE.RingGeometry( gyroscopeRingSize, gyroscopeRingThickness, 128 );
		gyroscopeMaterial = new THREE.MeshBasicMaterial( {
			color: colorHighlight,
			opacity: 0.25,
			transparent: true,
			blending: THREE.AdditiveBlending,
			side: THREE.DoubleSide,
			fog: true,
			depthWrite: false//, depthTest: false
		});
		gyroscopeMaterial.needsUpdate = true;
		/*
		gyroscopeMesh1 = new THREE.Mesh( gyroscopeGeometry, gyroscopeMaterial );
		gyroscopeMesh2 = new THREE.Mesh( gyroscopeGeometry, gyroscopeMaterial );
		gyroscopeMesh3 = new THREE.Mesh( gyroscopeGeometry, gyroscopeMaterial );
		gyroscopeMesh4 = new THREE.Mesh( gyroscopeGeometry, gyroscopeMaterial );
		*/
		gyroscopeMesh1 = new THREE.Mesh( gyroscopeGeometry, new THREE.MeshBasicMaterial( {
			color: colorBase,
			opacity: 0,
			transparent: true,
			blending: THREE.AdditiveBlending,
			side: THREE.DoubleSide,
			fog: true,
			depthWrite: false//, depthTest: false
		}) );
		gyroscopeMesh2 = new THREE.Mesh( gyroscopeGeometry, new THREE.MeshBasicMaterial( {
			color: colorBase,
			opacity: 0,
			transparent: true,
			blending: THREE.AdditiveBlending,
			side: THREE.DoubleSide,
			fog: true,
			depthWrite: false//, depthTest: false
		}) );
		gyroscopeMesh3 = new THREE.Mesh( gyroscopeGeometry, new THREE.MeshBasicMaterial( {
			color: colorBase,
			opacity: 0,
			transparent: true,
			blending: THREE.AdditiveBlending,
			side: THREE.DoubleSide,
			fog: true,
			depthWrite: false//, depthTest: false
		}) );
		gyroscopeMesh4 = new THREE.Mesh( gyroscopeGeometry, new THREE.MeshBasicMaterial( {
			color: colorBase,
			opacity: 0,
			transparent: true,
			blending: THREE.AdditiveBlending,
			side: THREE.DoubleSide,
			fog: true,
			depthWrite: false//, depthTest: false
		}) );

		var gyroscopeObject1 = new THREE.Object3D();
		var gyroscopeObject2 = new THREE.Object3D();
		var gyroscopeObject3 = new THREE.Object3D();
		var gyroscopeObject4 = new THREE.Object3D();

		gyroscopeObject1.rotation.x = 90 * toRAD;
		gyroscopeObject2.rotation.x = 90 * toRAD;
		gyroscopeObject3.rotation.x = 90 * toRAD;
		gyroscopeObject4.rotation.x = 90 * toRAD;

		gyroscopeObject1.rotation.y = 0 * toRAD;
		gyroscopeObject2.rotation.y = 0 * toRAD;
		gyroscopeObject3.rotation.y = 180 * toRAD;
		gyroscopeObject4.rotation.y = 0 * toRAD;

		gyroscopeObject1.rotation.z = 0 * toRAD;
		gyroscopeObject2.rotation.z = 90 * toRAD;
		gyroscopeObject3.rotation.z = 0 * toRAD;
		gyroscopeObject4.rotation.z = 270 * toRAD;

		gyroscopeObject1.add( gyroscopeMesh1 );
		gyroscopeObject2.add( gyroscopeMesh2 );
		gyroscopeObject3.add( gyroscopeMesh3 );
		gyroscopeObject4.add( gyroscopeMesh4 );

		gyroscopeObject.add( gyroscopeObject1 );
		gyroscopeObject.add( gyroscopeObject2 );
		gyroscopeObject.add( gyroscopeObject3 );
		gyroscopeObject.add( gyroscopeObject4 );

		gyroscopeCreated = true;

		if (callbackFn) {
			callbackFn();
		}
	}

	function renderGyroscope() {
		if (!gyroscopeCreated) return;
	}



	var rainObject,
		rainCloud,
		rainGeometry,
		rainShaderMaterial,
		rainShaderUniforms,
		rainSize = 5,
		rainParticlesTotal = 50,
		rainRingRadius = 40,
		rainBuffer = globeRadius - 15,
		rainMaxDistance = 100,
		rainFadeDistance = 15,
		rainVelocityFactor = 0.0016,
		rainDetails = [],
		rainCreated = false;
	function createRain(callbackFn) {
		rainObject  = new THREE.Group;
		rainObject.name = 'rainObject';
		scene.add(rainObject);

		rainGeometry = new THREE.BufferGeometry();

		rainShaderUniforms = {
			color:     { value: colorBase },
			texture:   { value: new THREE.TextureLoader().load( "img/dot-inverted.png" ) }
		};
		rainShaderMaterial = new THREE.ShaderMaterial( {
			uniforms:       rainShaderUniforms,
			vertexShader:   document.getElementById( 'particle_vertexshader' ).textContent,
			fragmentShader: document.getElementById( 'particle_fragmentshader' ).textContent,
			transparent:    true,
			blending:       THREE.AdditiveBlending,
			depthTest:      false
		});

		var positions = new Float32Array( rainParticlesTotal * 3 );
		var alphas = new Float32Array( rainParticlesTotal * 3 );
		var sizes = new Float32Array( rainParticlesTotal );
		//var rainSpread = rainMaxDistance/rainParticlesTotal;

		var circleAngle = 2 * Math.PI / rainParticlesTotal;

		for ( var i = 0, i3 = 0; i < rainParticlesTotal; i ++, i3 += 3 ) {

			var circleRadius = (Math.random() * rainRingRadius);

			// CREATE THE VERTICES ALL IN THE POSITIVE
			var vertex = new THREE.Vector3();
			vertex.x = circleRadius * Math.cos(circleAngle * i);
			vertex.y = Math.random() * rainMaxDistance;
			vertex.z = circleRadius * Math.sin(circleAngle * i);

			var destinationY = rainBuffer + rainMaxDistance;
			var startSize = Math.random() * rainSize;
			var startAlpha = Math.random() * 1;
			var startPercentage = (rainMaxDistance - vertex.y)/rainMaxDistance;
			var startVelocity = (1 - startPercentage) * ((rainMaxDistance * 2) / 100);

			// ADD THE CENTER DEAD ZONE
			vertex.y = vertex.y + rainBuffer;
			var originY = rainBuffer;

			// MAKE EVERY OTHER PARTICLE NEGATIVE
			if(i % 2 === 0) {
				vertex.y = -vertex.y;
				originY = -originY;
				destinationY = -destinationY;
			}

			positions[ i3 + 0 ] = vertex.x;
			positions[ i3 + 1 ] = vertex.y;
			positions[ i3 + 2 ] = vertex.z;
			sizes[ i ] = startSize;
			alphas[ i ] = 1; //startAlpha;

			rainDetails.push({
				origin: new THREE.Vector3(vertex.x, originY, vertex.z),
				current: new THREE.Vector3(vertex.x, vertex.y, vertex.z),
				destination: new THREE.Vector3(vertex.x, destinationY, vertex.z),
				size: startSize,
				alpha: startAlpha,
				velocity: startVelocity
			});
		}

		rainGeometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		rainGeometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
		rainGeometry.addAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );
		rainCloud = new THREE.Points( rainGeometry, rainShaderMaterial );
		rainObject.add( rainCloud );

		rainCreated = true;

		if (callbackFn) {
			callbackFn();
		}
	}

	function renderRain() {
		rainObject.rotation.y += rainObject.rotation.z + 0.0075;

		var attributes = rainGeometry.attributes;

		for ( var i = 0, i3 = 0; i < rainDetails.length; i ++, i3 += 3 ) {
			var pd = rainDetails[i];

			// MOVE THE PARTICLE UP/DOWN
			pd.velocity += rainVelocityFactor;
			if (pd.current.y > 0) {
				if (pd.current.y > pd.destination.y) {
					pd.current.y = rainBuffer;
					pd.velocity = 0;
				}
				pd.current.y = pd.current.y + pd.velocity;
			} else if (pd.current.y < 0) {
				if (pd.current.y < pd.destination.y) {
					pd.current.y = pd.origin.y;
					pd.velocity = 0;
				}
				pd.current.y = pd.current.y - pd.velocity;
			}
			attributes.position.array[ i3 + 1 ] = pd.current.y;

			// FADE THE PARTICLE IN
			if (pd.current.y > 0) {
				pd.alpha = (pd.current.y - rainBuffer) / ((pd.origin.y - rainBuffer) + rainFadeDistance);
			} else if (pd.current.y < 0) {
				pd.alpha = (pd.current.y + rainBuffer) / ((pd.origin.y + rainBuffer) - rainFadeDistance);
			}
			if (pd.alpha > 1) pd.alpha = 1;
			attributes.alpha.array[ i ] = pd.alpha;
			attributes.size.array[ i ] = pd.size * pd.alpha;

		}
		attributes.position.needsUpdate = true;
		attributes.alpha.needsUpdate = true;
		attributes.size.needsUpdate = true;
	}



	var rendererPixi,
		stagePixi,
		minimapVizGroup,
		minimapDetails,
		minimapMaskGradient,
		minimapLines,
		minimapExtras1,
		minimapExtras2,
		minimapSpiral,
		minimapSpikesGroup,
		minimapBlipsGroup,
		minimapXArray,
		minimapBlipArray,
		minimapBgCreated = false;
	function createMinimapBg(callbackFn) {

		rendererPixi = new PIXI.autoDetectRenderer(1000, 320, {
			transparent: true,
			antialias: true
		});
		stagePixi = new PIXI.Stage();
		$("#minimapBackground").append(rendererPixi.view);

		minimapVizGroup = new PIXI.Container();
		stagePixi.addChild(minimapVizGroup);

		//DETAILS
		minimapDetails = new PIXI.Sprite.fromImage('img/mapDetails.png');
		minimapVizGroup.addChild(minimapDetails);
		minimapDetails.position.x = 0;
		minimapDetails.position.y = 0;
		minimapDetails.width = 1000;
		minimapDetails.height = 320;
		minimapDetails.tint = 0x33CCFF;

		// GRADIENT MASK
		minimapMaskGradient = new PIXI.Sprite.fromImage('img/mapGradient2.png');
		minimapVizGroup.addChild(minimapMaskGradient);
		minimapMaskGradient.position.x = 500;
		minimapMaskGradient.position.y = 160;
		minimapMaskGradient.width = 1000;
		minimapMaskGradient.height = 320;
		minimapMaskGradient.pivot.x = 500;
		minimapMaskGradient.pivot.y = 160;
		minimapMaskGradient.scale.x = 0;

		// LINES
		minimapLines = new PIXI.Sprite.fromImage('img/mapLines.png');
		minimapVizGroup.addChild(minimapLines);
		minimapLines.position.x = 0;
		minimapLines.position.y = 0;
		minimapLines.width = 1000;
		minimapLines.height = 320;
		minimapLines.tint = 0xFFFFFF;
		minimapLines.mask = minimapMaskGradient;

		minimapExtras1 = new PIXI.Sprite.fromImage('img/mapExtras1.png');
		minimapVizGroup.addChild(minimapExtras1);
		minimapExtras1.pivot.x = 160;
		minimapExtras1.pivot.y = 160;
		minimapExtras1.position.x = 500;
		minimapExtras1.position.y = 160;
		minimapExtras1.alpha = 0;

		minimapExtras2 = new PIXI.Sprite.fromImage('img/mapExtras2.png');
		minimapVizGroup.addChild(minimapExtras2);
		minimapExtras2.pivot.x = 160;
		minimapExtras2.pivot.y = 160;
		minimapExtras2.position.x = 500;
		minimapExtras2.position.y = 160;
		minimapExtras2.alpha = 0;

		minimapMaskCircle = new PIXI.Sprite.fromImage('img/mapCircles.png');
		minimapVizGroup.addChild(minimapMaskCircle);
		minimapMaskCircle.position.x = 0;
		minimapMaskCircle.position.y = 0;
		minimapMaskCircle.width = 1000;
		minimapMaskCircle.height = 320;

		minimapSpiral = new PIXI.Sprite.fromImage('img/mapGradient1.png');
		minimapVizGroup.addChild(minimapSpiral);
		minimapSpiral.position.x = 500;
		minimapSpiral.position.y = 160;
		minimapSpiral.width = 1000;
		minimapSpiral.height = 320;
		minimapSpiral.pivot.x = 500;
		minimapSpiral.pivot.y = 160;
		minimapSpiral.scale.x = 0.05;
		minimapSpiral.alpha = 0;
		minimapSpiral.mask = minimapMaskCircle;

		minimapSpikesGroup = new PIXI.Container();
		minimapVizGroup.addChild(minimapSpikesGroup);
		minimapSpikesGroup.width = 320;
		minimapSpikesGroup.height = 320;
		minimapSpikesGroup.x = 500;
		minimapSpikesGroup.y = 160;
		minimapSpikesGroup.scale.x = 0;
		minimapSpikesGroup.scale.y = 0;

			var minimapX1 = new PIXI.Graphics();
			minimapSpikesGroup.addChild(minimapX1);
			minimapX1.beginFill(0xFFFFFF, 1);
			minimapX1.drawRect(0, 0, 1, 35);
			minimapX1.endFill();
			minimapX1.pivot.x = 0.5;
			minimapX1.pivot.y = 35;
			minimapX1.rotation = 45 * toRAD;
			minimapX1.position.x = -90;
			minimapX1.position.y = 90;

			var minimapX2 = new PIXI.Graphics();
			minimapSpikesGroup.addChild(minimapX2);
			minimapX2.beginFill(0xFFFFFF, 1);
			minimapX2.drawRect(0, 0, 1, 35);
			minimapX2.endFill();
			minimapX2.pivot.x = 0.5;
			minimapX2.pivot.y = 35;
			minimapX2.rotation = 135 * toRAD;
			minimapX2.position.x = -90;
			minimapX2.position.y = -90;

			var minimapX3 = new PIXI.Graphics();
			minimapSpikesGroup.addChild(minimapX3);
			minimapX3.beginFill(0xFFFFFF, 1);
			minimapX3.drawRect(0, 0, 1, 35);
			minimapX3.endFill();
			minimapX3.pivot.x = 0.5;
			minimapX3.pivot.y = 35;
			minimapX3.rotation = 225 * toRAD;
			minimapX3.position.x = 90;
			minimapX3.position.y = -90;

			var minimapX4 = new PIXI.Graphics();
			minimapSpikesGroup.addChild(minimapX4);
			minimapX4.beginFill(0xFFFFFF, 1);
			minimapX4.drawRect(0, 0, 1, 35);
			minimapX4.endFill();
			minimapX4.pivot.x = 0.5;
			minimapX4.pivot.y = 35;
			minimapX4.rotation = 315 * toRAD;
			minimapX4.position.x = 90;
			minimapX4.position.y = 90;

		// BLIPS
		minimapBlipsGroup = new PIXI.Container();
		minimapVizGroup.addChild(minimapBlipsGroup);
		minimapBlipsGroup.width = 320;
		minimapBlipsGroup.height = 320;
		minimapBlipsGroup.x = 500;
		minimapBlipsGroup.y = 160;
		minimapBlipsGroup.scale.x = 0;
		minimapBlipsGroup.scale.y = 0;

			var minimapBlip1 = new PIXI.Graphics();
			minimapBlip1.beginFill(0xFFFFFF);
			minimapBlip1.drawCircle(0, 0, 1);
			minimapBlip1.endFill();
			minimapBlip1.position.x = -95;
			minimapBlip1.position.y = -95;
			minimapBlipsGroup.addChild(minimapBlip1);

			var minimapBlip2 = new PIXI.Graphics();
			minimapBlip2.beginFill(0xFFFFFF);
			minimapBlip2.drawCircle(0, 0, 1);
			minimapBlip2.endFill();
			minimapBlip2.position.x = 95;
			minimapBlip2.position.y = -95;
			minimapBlipsGroup.addChild(minimapBlip2);

			var minimapBlip3 = new PIXI.Graphics();
			minimapBlip3.beginFill(0xFFFFFF);
			minimapBlip3.drawCircle(0, 0, 1);
			minimapBlip3.endFill();
			minimapBlip3.position.x = -95;
			minimapBlip3.position.y = 95;
			minimapBlipsGroup.addChild(minimapBlip3);

			var minimapBlip4 = new PIXI.Graphics();
			minimapBlip4.beginFill(0xFFFFFF);
			minimapBlip4.drawCircle(0, 0, 1);
			minimapBlip4.endFill();
			minimapBlip4.position.x = 95;
			minimapBlip4.position.y = 95;
			minimapBlipsGroup.addChild(minimapBlip4);

		minimapXArray = [minimapX1, minimapX2, minimapX3, minimapX4];
		minimapBlipArray = [minimapBlip1, minimapBlip2, minimapBlip3, minimapBlip4];

		minimapBgCreated = true;

		if (callbackFn) {
			callbackFn();
		}
	}

	function renderMinimapBg() {
		rendererPixi.render(stagePixi);
	}



	function checkDistance(a, b) {
		return Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y) + (b.z - a.z) * (b.z - a.z) );
	}

    function latLongToVector3(lat, lon, radius, height) {
        var phi = (lat)*Math.PI/180;
        var theta = (lon-180)*Math.PI/180;
        var x = -(radius+height) * Math.cos(phi) * Math.cos(theta);
        var y = (radius+height) * Math.sin(phi);
        var z = (radius+height) * Math.cos(phi) * Math.sin(theta);
        return new THREE.Vector3(x,y,z);
    }

	function animate() {
		requestAnimationFrame( animate );
		render();
		/*
		if (statsCreated) {
			stats.update();
		}
		*/
	}

	var cameraDirection = "left";
	var cameraTarget = "auto";
	var rotationSpeed = { value: 0.001 };
	var dragSpeed = 0.1;
	var dragZone = 50;
	var dragSpeedSlowZone = (globeMaxZoom + dragZone);

	function render() {
		if (!preloaderComplete) return;
		renderer.render( scene, camera );

		// DON'T DO ANYTHING IF SECTION NOT FULLY IN
		if (isGlobeEventsEnabled) {
			// ZOOM LEVEL
			if (targetCameraZ < globeMaxZoom) targetCameraZ = globeMaxZoom;
			if (targetCameraZ > globeMinZoom) targetCameraZ = globeMinZoom;
			camera.position.z = camera.position.z += ( targetCameraZ - camera.position.z ) * 0.01;
		}

		//if (deviceSettings.isMobile) dragSpeed = 0.025;
		if ( targetCameraZ < dragSpeedSlowZone ){
			dragSpeed = 0.025;
			//if (deviceSettings.isMobile) dragSpeed = 0.0025;
		}

		// DON'T TRY AND ROTATE THE MAP UNLESS USER HAS ROTATED GLOBE MANUALLY
		if ( isGlobeRotated ) {
			// ROTATION UP/DOWN
			if (targetRotationX > 75 * toRAD) targetRotationX = 75 * toRAD;
			if (targetRotationX < -75 * toRAD) targetRotationX = -75 * toRAD;
			rotationObject.rotation.x = rotationObject.rotation.x += ( targetRotationX - rotationObject.rotation.x ) * dragSpeed;
			rotationObject.rotation.y = rotationObject.rotation.y += ( targetRotationY - rotationObject.rotation.y ) * dragSpeed;
		}
		if (cameraTarget == "auto" && isGlobeRotated) {
			if (isMouseDown || isParticleHit || isMediaHit) {
				// TODO
			} else {
				switch (cameraDirection) {
					case "left":
						targetRotationY += rotationSpeed.value;
						break;
					case "right":
						targetRotationY -= rotationSpeed.value;
						break;
				}
			}
		}

		if (globeCreated) renderGlobe();
		if (dotsCreated) renderDots();
		if (mediaCreated) renderMedia();
		if (starsCreated) renderStars();
		if (ringPulseCreated) renderRingPulse();
		if (gyroscopeCreated) renderGyroscope();
		if (rainCreated) renderRain();
		if (ringsCreated) renderRings();
		if (minimapBgCreated) renderMinimapBg();


		if (colorTypeCurrent == "cycle") {
			setColors("cycle");
		}

		checkHover();
	}


	var currentLocationTitle = "";

	function checkHover() {
		if (!isMouseMoved) return;

		globeRaycaster.setFromCamera( mouse, camera );
		var intersects = globeRaycaster.intersectObjects( dotSpritesArray , true);
		var intersection = ( intersects.length ) > 0 ? intersects[ 0 ] : null;
		if ( intersects.length > 0 ) {
			var tempCurrentLocationTitle = dataMap[intersection.object.userData.id][4];
			var tempHoverTarget = dotSpritesHoverArray[intersection.object.userData.id];
			if (!isParticleHit || tempCurrentLocationTitle != currentLocationTitle) {
				currentLocationTitle = tempCurrentLocationTitle;
				isParticleHit = true;
				showTooltip();
				if (!TweenMax.isTweening(tempHoverTarget.scale)) {
					TweenMax.fromTo( tempHoverTarget.scale, 1, { x: 2, y: 2 }, { x: 10, y: 10, ease: Expo.easeOut });
					TweenMax.fromTo( tempHoverTarget.material, 1.5, { opacity: 1 }, { opacity: 0,
						onStart:function(){
							tempHoverTarget.visible = true;
						},
						onComplete:function(){
							tempHoverTarget.visible = false;
						}
					});
				}
			} else {
				//dotSpikeHover.visible = true;
			}
		} else {
			currentLocationTitle = "";
			isParticleHit = false;
			//hideTooltip();
			if (!isMediaHit) {
				hideTooltip();
			}
		}

		// MEDIA HOVER V2
		var intersects = globeRaycaster.intersectObject( mediaCloud, true );
		var intersection = ( intersects.length ) > 0 ? intersects[ 0 ] : null;
		/*if ( intersects.length > 0 ) {
			var tempCurrentLocationTitle = "<b>" + dataMedia[intersection.index][0] + "</b> - " + dataMedia[intersection.index][4];{
			currentLocationTitle = tempCurrentLocationTitle;
			if (!isMediaHit)
				isMediaHit = true;
				showTooltip();
			}
		} else {
			currentLocationTitle = "";
			isMediaHit = false;
			//hideTooltip();
			if (!isParticleHit) {
				hideTooltip();
			}
		}*/
	}

	// SHOW/HIDE THE TOOLTIP
	var isTooltipVisible = false;
	function showTooltip(type) {
		container.style.cursor = 'pointer';
		$('#tooltip').html('<div class="label">' + currentLocationTitle + '</div>');
		if (!isTooltipVisible) {
			isTooltipVisible = true;
			if (clientMouseX > (window.innerWidth - 250)) {
				TweenMax.fromTo( "#tooltip", 1, { x: -100, autoAlpha: 0 }, { x: 0, autoAlpha: 1, display: 'inline-block', ease: Expo.easeOut, delay: 0.1 });
				document.getElementById("tooltip").style.textAlign = "right";
			} else {
				TweenMax.fromTo( "#tooltip", 1, { x: 100, autoAlpha: 0 }, { x: 0, autoAlpha: 1, display: 'inline-block', ease: Expo.easeOut, delay: 0.1 });
				document.getElementById("tooltip").style.textAlign = "left";
			}
		}
	}

	function hideTooltip() {
		isTooltipVisible = false;
		if (isMouseDown) {
			container.style.cursor = 'move';
		} else {
			//container.style.cursor = 'auto';
			container.style.cursor = 'move';
		}
		TweenMax.set( "#tooltip", { autoAlpha: 0, display: 'none' });
	}

	function checkClick() {
		globeRaycaster.setFromCamera( mouse, camera );

		// DOTS
		var intersects = globeRaycaster.intersectObjects( dotSpritesArray , true);
		var intersection = ( intersects.length ) > 0 ? intersects[ 0 ] : null;
		if ( intersects.length > 0 ) {

			var bookType = dataMap[intersection.object.userData.id][1]
			var bookDescription = "";
			if (bookType === 0) bookDescription = "";
			if (bookType === 1) bookDescription = "";
			if (bookType === 2) bookDescription = "";

			TweenMax.killTweensOf( "#location", false) ;
			var tl =  new TimelineMax({ paused: true } );
			tl.fromTo( "#location", 0.5, { autoAlpha: 0 }, { autoAlpha: 1, display: 'block', immediateRender: false, ease: Linear.easeNone }, 0 );
			tl.fromTo( "#location .title", 1, { scrambleText:{ text: " " } }, { scrambleText:{ text: dataMap[intersection.object.userData.id][4], chars:"0123456789!@#$%^&*()" }, ease: Expo.easeInOut }, 0 );
			tl.fromTo( "#location .booktype", 1, { scrambleText:{ text: " " } }, { scrambleText:{ text: bookDescription, chars:"0123456789!@#$%^&*()" }, ease: Expo.easeInOut }, 0 );
			tl.fromTo( "#location", 1, { autoAlpha: 1 }, { autoAlpha: 0, immediateRender: false, ease: Linear.easeNone }, 1 );
			tl.play(0);
		}

		// MEDIA
		var intersects = globeRaycaster.intersectObject( mediaCloud, true);
		var intersection = ( intersects.length ) > 0 ? intersects[ 0 ] : null;
		/*if ( intersects.length > 0 ) {
			var mediaDestination = dataMedia[intersection.index][5];
			intersection.index
			window.open(mediaDestination,"_blank");
		}*/


	}

	// HEADER TAGLINE GENERATION
	function changeTagline() {
		var taglineArray = [
			["01","IVANOVA & Co PRESENTS"],
			["01","IVANOVA & Co PRESENTS"],
			["01","IVANOVA & Co PRESENTS"]
			];
		var tempTaglineLength = taglineArray.length - 1;
		var tempTagline = generateRandomNumber(0,tempTaglineLength);
		$('#bookNumber').html('');
		$('#bookNumber').html('#' + taglineArray[tempTagline][0]);
		$('#bookQuote').html('');
		$('#bookQuote').html('"' + taglineArray[tempTagline][1] + '"');
	}

	// BUTTONS LOGIC
	function initButtons() {
		var isDragging = false;
		$('#minimap').mousedown(function(e) {
			//isDragging = false;
			setRotation("manual");
			isDragging = true;
		})
		.mousemove(function(e) {
			if (isDragging) {
				var offset_t = $(this).offset().top - $(window).scrollTop();
				var offset_l = $(this).offset().left - $(window).scrollLeft();
				var left = Math.round( (e.clientX - offset_l) );
				var top = Math.round( (e.clientY - offset_t) );
				var tempWidthPercentage = left/$(this).width();
				var tempHeightPercentage = top/$(this).height();
				var maxVertDegrees = 75;
				var maxHorizontalDegrees = 180;
				var mapTargetRotationX = tempHeightPercentage * (maxVertDegrees * 2) - (maxVertDegrees + 15);
				var mapTargetRotationY = tempWidthPercentage * (maxHorizontalDegrees * 2);
				var baseRotationX = (Math.round(rotationObject.rotation.x /radianLoop) * radianLoop);
				var baseRotationY = (Math.round(rotationObject.rotation.y /radianLoop) * radianLoop);
				targetRotationX = baseRotationX + (-mapTargetRotationX * toRAD);
				targetRotationY = baseRotationY - ((mapTargetRotationY - maxHorizontalDegrees) * toRAD);
			}
		 })
		.mouseleave(function(e) {
			isDragging = false;
		 })
		.mouseup(function(e) {
			var wasDragging = isDragging;
			isDragging = false;
			setRotation("manual");

			//if (!wasDragging) { }

			var offset_t = $(this).offset().top - $(window).scrollTop();
			var offset_l = $(this).offset().left - $(window).scrollLeft();
			var left = Math.round( (e.clientX - offset_l) );
			var top = Math.round( (e.clientY - offset_t) );
			var tempWidthPercentage = left/$(this).width();
			var tempHeightPercentage = top/$(this).height();
			var maxVertDegrees = 75;
			var maxHorizontalDegrees = 180;
			var mapTargetRotationX = tempHeightPercentage * (maxVertDegrees * 2) - (maxVertDegrees + 15);
			var mapTargetRotationY = tempWidthPercentage * (maxHorizontalDegrees * 2);
			var baseRotationX = (Math.round(rotationObject.rotation.x /radianLoop) * radianLoop);
			var baseRotationY = (Math.round(rotationObject.rotation.y /radianLoop) * radianLoop);
			targetRotationX = baseRotationX + (-mapTargetRotationX * toRAD);
			targetRotationY = baseRotationY - ((mapTargetRotationY - maxHorizontalDegrees) * toRAD);
		});

		$('#palette').click(function(e) {
			setColors("random");
		});

		if (!deviceSettings.isMobile) {
			$('.close').hover(function(e) {
				//TweenMax.to( ".close line", 0.5, { drawSVG: "30% 70%", stroke: colorSecondary, ease: Expo.easeOut } );
				TweenMax.to( ".close .line1", 0.5, { attr:{ x1: 15, y1: 15, x2: 35, y2: 35 },  stroke: colorSecondary, ease: Expo.easeOut } );
				TweenMax.to( ".close .line2", 0.5, { attr:{ x1: 15, y1: 35, x2: 35, y2: 15 },  stroke: colorSecondary, ease: Expo.easeOut } );
				TweenMax.fromTo( ".close circle", 0.5, { drawSVG: "50% 50%", stroke: colorSecondary }, { drawSVG: "35% 65%", stroke: colorPrimary, display: 'block', ease: Expo.easeOut } );
				TweenMax.fromTo( ".close circle", 0.25, { autoAlpha: 0 }, { autoAlpha: 1, ease: Linear.easeNone } );
			}, function(e) {
				//TweenMax.to( ".close line", 0.5, { drawSVG: "0 100%", stroke: colorPrimary, ease: Expo.easeOut } );
				TweenMax.to( ".close .line1", 0.5, { attr:{ x1: 0, y1: 0, x2: 50, y2: 50 },  stroke: colorPrimary, ease: Expo.easeOut } );
				TweenMax.to( ".close .line2", 0.5, { attr:{ x1: 0, y1: 50, x2: 50, y2: 0 },  stroke: colorPrimary, ease: Expo.easeOut } );
				TweenMax.to( ".close circle", 0.5, { drawSVG: "50% 50%", stroke: colorSecondary, autoAlpha: 0, ease: Expo.easeOut } );
				TweenMax.to( ".close circle", 0.5, { autoAlpha: 0, ease: Linear.easeNone } );
			});

			$('#nav-left a').hover(function(e) {
				var tempText = $(this).attr("data-id");
				TweenMax.fromTo( this, 1, { scrambleText:{ text: " " }, autoAlpha: 0 }, { scrambleText:{ text: tempText, chars:"0123456789!@#$%^&*()", revealDelay: 0.1 }, autoAlpha: 1 });
			}, function(e) {
			});

			$('#nav-right a').hover(function(e) {
				var tempText = $(this).attr("data-id");
				TweenMax.fromTo( this, 1, { scrambleText:{ text: " " }, autoAlpha: 0 }, { scrambleText:{ text: tempText, chars:"0123456789!@#$%^&*()", revealDelay: 0.1, rightToLeft:true }, autoAlpha: 1 });
			}, function(e) {
			});

			$(document).keydown(function (e) {
				var keyCode = e.keyCode || e.which, key = {
						left: 37, up: 38, right: 39, down: 40,
						blue: 66, invert: 73, random: 82
					};
				var tempRotation = (20 * toRAD);
				switch (keyCode) {
					case key.left:
						targetRotationY = targetRotationY - tempRotation;
						 cameraDirection = "right";
						break;
					case key.right:
						targetRotationY = targetRotationY + tempRotation;
						cameraDirection = "left";
						break;
					case key.up:
						//targetRotationX = targetRotationX + tempRotation;
						targetCameraZ = targetCameraZ - 20;
						break;
					case key.down:
						//targetRotationX = targetRotationX - tempRotation;
						targetCameraZ = targetCameraZ + 20;
						break;
					case key.blue:
						setColors("blue");
						break;
					case key.invert:
						setColors("invert");
						break;
					case key.random:
						setColors("random");
						break;
				}
			});


			// BOOK HOVER

			$('.book').hover(
				function(){
					TweenMax.to( $(this).find('.overlay'), 0.75, { autoAlpha: 1, immediateRender: false, ease: Expo.easeOut } );
					TweenMax.to( $(this).find('.overlay'), 0.75, { rotationY: -40, immediateRender: false, ease: Expo.easeOut } );
					TweenMax.to( $(this).find('.cover'), 0.75, { rotationY: -40, immediateRender: false, ease: Expo.easeOut } );
					TweenMax.to( $(this).find('.page1'), 0.75, { rotationY: -34, immediateRender: false, ease: Expo.easeOut } );
					TweenMax.to( $(this).find('.page2'), 0.75, { rotationY: -27, immediateRender: false, ease: Expo.easeOut } );
					TweenMax.to( $(this).find('.page3'), 0.75, { rotationY: -15, immediateRender: false, ease: Expo.easeOut } );
					TweenMax.to( "#buytext", 0.75, { y: 15, immediateRender: false, ease: Expo.easeOut } );
				},
				function(){
					TweenMax.to( $(this).find('.overlay'), 0.5, { autoAlpha: 0, immediateRender: false, ease: Expo.easeOut } );
					TweenMax.to( $(this).find('.overlay'), 0.5, { rotationY: 0, immediateRender: false, ease: Expo.easeOut } );
					TweenMax.to( $(this).find('.cover'), 0.5, { rotationY: 0, immediateRender: false, ease: Expo.easeOut } );
					TweenMax.to( $(this).find('.page'), 0.5, { rotationY: 0, immediateRender: false, ease: Expo.easeOut } );
					TweenMax.to( "#buytext", 0.5, { y: 0, immediateRender: false, ease: Expo.easeOut } );
			 });
		}
	}

	// RESET ANIMATIONS
	function resetAnimations(instant) {
		lineStepStarted = 0;
		lineStepCompleted = 0;

		// HIDE AND RESET ALL LINES
		if (scene.getObjectByName('arcsRocket')) {
			//if (!arcRocketCreated) return;
			var attributes = arcRocketBufferGeometry.attributes;
			for ( var i = 0; i < arcRocketDetailsArray.length; i++ ) {
				attributes.alpha.array[ i ] = 0;
			}
			attributes.alpha.needsUpdate = true;

			arcRocketAnimation.pause(0);
			arcRocketObject.visible = false;
			earthObject.remove( arcRocketObject );
		}

		if (scene.getObjectByName('arcsSnake')) {
			//if (!arcSnakeCreated) return;
			var attributes = arcSnakeBufferGeometry.attributes;
			for ( var i = 0; i < arcSnakeDetailsArray.length; i++ ) {
				attributes.alpha.array[ i ] = 0;
			}
			attributes.alpha.needsUpdate = true;

			arcSnakeAnimation.pause(0);
			arcSnakeObject.visible = false;
			earthObject.remove( arcSnakeObject );
		}

		if (scene.getObjectByName('arcsAll')) {
			arcAllAnimation.pause(0);
			arcAllObject.visible = false;
			earthObject.remove( arcAllObject );
		}

	}

	// UI FUNCTIONS
	function setRotation(type) {
		$('#rotationMode a').removeClass('active');
		if (type === "toggle") {
			switch (cameraTarget) {
				case "auto":
					type = "manual";
					//$('#rotationMode a').html("off");
					break;
				case "manual":
					type = "auto";
					//$('#rotationMode a').html(type);
					break;
			}
		}
		cameraTarget = type;
		switch (cameraTarget) {
			case "auto":
				$('#rotationMode a.auto').addClass('active');
				//$('#rotationMode a').html("AUTO");
				break;
			case "manual":
				$('#rotationMode a.manual').addClass('active');
				//$('#rotationMode a').html("AUTO");
				break;
		}
	}

	function toggleRotation() {
		if (cameraTarget == "auto") {
			setRotation("manual");
		} else {
			setRotation("auto");
		}
	}

	var currentAnimationType = "";
	function setArcAnimation(type) {

		if (!arcRocketCreated) {
			createArcsRocket();
		}
		if (!arcSnakeCreated) {
			createArcsSnake();
		}
		if (!arcAllCreated) {
			createArcsAll();
		}

		if (currentAnimationType === type) {
			type = "off";
		}

		currentAnimationType = type;
		resetAnimations();
		$('#arcMode a').removeClass('active');
		switch (type) {
			case "rocket":
				earthObject.add( arcRocketObject );
				arcRocketObject.visible = true;
				arcRocketAnimation.play(0);
				$('#arcMode a.rocket').addClass('active');
				break;
			case "snake":
				earthObject.add( arcSnakeObject );
				arcSnakeObject.visible = true;
				arcSnakeAnimation.play(0);
				$('#arcMode a.snake').addClass('active');
				break;
			case "all":
				arcAllAnimation.play(0);
				earthObject.add( arcAllObject );
				arcAllObject.visible = true;
				$('#arcMode a.all').addClass('active');
				break;
			case "off":
				//$('#arcMode a.off').addClass('active');
				break;
		}
		if (isIntroDone) {
			generateGlitch();
		}
	}

	var colorTypeCurrent = "";
	function setColors(type) {
		//if (colorTypeCurrent != type) { }

		colorTypeCurrent = type;
		$('#colorMode a').removeClass('active');

		switch (type) {
			case "off":
				colorPrimary 	= "#FFFFFF";
				colorSecondary 	= "#FFFFFF";
				$('#colorMode a.off').addClass('active');
				break;
			case "blue":
				colorPrimary 	= colorPrimary_Base;
				colorSecondary 	= colorSecondary_Base;
				$('#colorMode a.blue').addClass('active');
				break;
			case "invert":
				if (colorPrimary === "#FFFFFF" && colorSecondary === "#FFFFFF") {
					colorPrimary 	= colorPrimary_Base;
					colorSecondary 	= colorSecondary_Base;
				}
				var tempColorPrimary = colorPrimary;
				var tempColorSecondary = colorSecondary;
				colorPrimary 	= tempColorSecondary;
				colorSecondary 	= tempColorPrimary;
				$('#colorMode a.invert').addClass('active');
				break;
			case "random":
				colorPrimary 	= "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
				colorSecondary 	= "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
				$('#colorMode a.random').addClass('active');
				break;
			case "cycle":
				var time = Date.now() * 0.00005;
				h = ( 360 * ( 1.0 + time ) % 360 ) / 360;
				var tempPrimary = new THREE.Color(colorPrimary);
				colorPrimary = tempPrimary.setHSL( h, 0.5, 0.5 );
				colorPrimary = "#" + colorPrimary.getHexString();
				var tempSecondary = new THREE.Color(colorSecondary);
				colorSecondary = tempSecondary.setHSL( h, 0.5, 0.5 );
				colorSecondary = "#" + colorSecondary.getHexString();
				$('#colorMode a.cycle').addClass('active');
				break;
		}

		// CREATE ALL OF THE COLORS
		colorBase 	= new THREE.Color(colorPrimary);
		colorBase50 = new THREE.Color(shadeBlend(0.50, colorPrimary, colorDarken));
		colorBase75 = new THREE.Color(shadeBlend(0.75, colorPrimary, colorDarken));
		colorBase85 = new THREE.Color(shadeBlend(0.85, colorPrimary, colorDarken));
		colorHighlight 	= new THREE.Color(colorSecondary);

		if (scene.getObjectByName('rain')) {
			rainCloud.material.uniforms.color.value = new THREE.Color(colorPrimary);
			rainCloud.material.uniforms.needsUpdate = true;
		}

		// UPDATE LIGHTS
		if (lightsCreated) {
			lightShield1.color = colorBase;
			lightShield2.color = colorBase;
			lightShield3.color = colorBase;
			lightShield1.needsUpdate = true;
			lightShield2.needsUpdate = true;
			lightShield3.needsUpdate = true;
		}
		if (ringsCreated) {
			ringsOuterMaterial.color = colorBase75; //colorBase85;
			ringsInnerMaterial.color = colorBase50; //colorBase75;
			ringsOuterMaterial.needsUpdate = true;
			ringsInnerMaterial.needsUpdate = true;
		}
		if (universeCreated) {
			universeBgMaterial.color = colorBase;
			universeBgMaterial.needsUpdate = true;
		}
		if (globeCreated) {
			globeInnerMaterial.color = colorBase75;
			globeOuterMaterial.color = colorBase;
			globeShieldMaterial.color = colorBase75;
			globeGlowMaterial.color = colorBase;
			globeInnerMaterial.needsUpdate = true;
			globeOuterMaterial.needsUpdate = true;
			globeShieldMaterial.needsUpdate = true;
			globeGlowMaterial.needsUpdate = true;

			// COLOR CHECKERED UPDATE
			var colors = new Float32Array(globeCloudVerticesArray.length * 3);
			var globeCloudColors = [];
			for( var i = 0; i < globeCloudVerticesArray.length; i++ ) {
				var tempPercentage = generateRandomNumber( 85, 90 ) * .01;
				var shadedColor = shadeBlend(tempPercentage, colorPrimary, colorDarken);
				globeCloudColors[i] = new THREE.Color(shadedColor);
			}
			for (var i = 0; i < globeCloudVerticesArray.length; i++) {
				colors[i * 3] = globeCloudColors[i].r;
				colors[i * 3 + 1] = globeCloudColors[i].g;
				colors[i * 3 + 2] = globeCloudColors[i].b;
			}
			globeCloudBufferGeometry.addAttribute( 'color', new THREE.BufferAttribute(colors, 3));
			globeCloudBufferGeometry.colorsNeedUpdate = true;
		}
		if (dotsCreated) {
			dotMaterial.color = colorHighlight;
			dotSpikesMaterial.color = colorHighlight;
			//dotSpikesExtraMaterial.color = colorBase;
			dotMaterial.needsUpdate = true;
			dotSpikesMaterial.needsUpdate = true;
			//dotSpikesExtraMaterial.needsUpdate = true;
			for (var i = 0; i < dotSpritesHoverArray.length; i++) {
				dotSpritesHoverArray[i].material.color = colorHighlight;
				dotSpritesHoverArray[i].material.needsUpdate = true;
			}
		}
		if (starsCreated) {
			starsMaterial.color = colorBase50;
			starsMaterial.needsUpdate = true;
		}
		if (arcRocketCreated) {
			//if (scene.getObjectByName('arcsRocket')) {}
			arcRocketMesh.material.uniforms.color.value = colorHighlight;
			arcRocketMesh.material.uniforms.needsUpdate = true;
		}
		if (arcSnakeCreated) {
			//if (scene.getObjectByName('arcsSnake')) {}
			arcSnakeMesh.material.uniforms.color.value = colorHighlight;
			arcSnakeMesh.material.uniforms.needsUpdate = true;
		}
		if (arcAllCreated) {
			//if (scene.getObjectByName('arcsAll')) {}
			arcAllMaterial.color = colorHighlight;
			arcAllMaterial.needsUpdate = true;
		}
		if (spikesCreated) {
			spikesMaterial.color = colorBase75;
			spikesMaterial.needsUpdate = true;
		}
		if (ringPulseCreated) {
			//if (scene.getObjectByName('ringPulse')) {}
			ringPulseMesh.material.uniforms.color.value = colorBase;
			ringPulseMesh.material.uniforms.needsUpdate = true;

			ringExplosionMaterial.color = colorBase85;
			ringExplosionMaterial.needsUpdate = true;

			ringPointMaterial.color = colorBase75;
			ringPointMaterial.needsUpdate = true;
		}
		if (gyroscopeCreated) {
			//gyroscopeMaterial.color = colorHighlight;
			//gyroscopeMaterial.needsUpdate = true;
			gyroscopeMesh1.material.color = colorBase;
			gyroscopeMesh2.material.color = colorBase;
			gyroscopeMesh3.material.color = colorBase;
			gyroscopeMesh4.material.color = colorBase;
			gyroscopeMesh1.material.needsUpdate = true;
			gyroscopeMesh2.material.needsUpdate = true;
			gyroscopeMesh3.material.needsUpdate = true;
			gyroscopeMesh4.material.needsUpdate = true;
		}
		if (rainCreated) {
			rainCloud.material.uniforms.color.value = colorBase;
			rainCloud.material.uniforms.needsUpdate = true;
		}

		// CHANGE SOME CSS VALUES
		if($("#customCSS").length == 1) {
			$('#customCSS').remove();
		}

		var tempRGB = hexToRgb(colorPrimary);
		var cssStyle =
		'<style id="customCSS">'+
			'body, a:link, a:visited { color: ' + colorPrimary + ';} '+
			'.settings a { border-color: rgba(' + tempRGB.r + ', ' + tempRGB.g + ', ' + tempRGB.b + ', .15);} '+
			'.settings a.active { background-color: ' + colorPrimary + ';} '+
			'#rotationMode a { color: ' + shadeBlend(0.50, colorPrimary, colorDarken) + ';} '+
			'#rotationMode a.active { color: ' + colorPrimary + ';} '+
			'.svg-stop { stop-color: ' + colorPrimary + ';} '+
			'.pulseDot { background-color: ' + colorPrimary + ';} '+
			'.pulseTrail { background-color: ' + colorPrimary + ';} '+
			'#tooltip { background-color: ' + colorPrimary + ';} '+
			'#soundButton .bar:after { background-color: ' + colorPrimary + ';} '+
			'#soundButton .bar:after { background-color: ' + colorPrimary + ';} '+
			'#paletteHighlight { background-color: ' + colorSecondary + ';} '+
			'#paletteBase { background-color: ' + colorPrimary + ';} '+
			'#paletteBase50 { background-color: ' + shadeBlend(0.50, colorPrimary, colorDarken) + ';} '+
			'#paletteBase75 { background-color: ' + shadeBlend(0.75, colorPrimary, colorDarken) + ';} '+
			'#paletteBase85 { background-color: ' + shadeBlend(0.85, colorPrimary, colorDarken) + ';} '+
			'.minibar { background-color: ' + shadeBlend(0.50, colorSecondary, colorDarken) + ';} '+
			'#location { color: ' + colorSecondary + ';} '+
		'</style>';

		$('head').append(cssStyle);
		$('#minimap svg path, .svg-fill').css("fill", colorPrimary);
		$('.close .line1, .close .line2, .close .bracket_x, .close .circle_x, .svg-ring, .cross, .pulseCircle circle').css("stroke", colorPrimary);

		if (isIntroDone && colorTypeCurrent != "cycle") {
			generateGlitch();
		}
	}

	// HEADER TAGLINE GENERATION
	var statNumber = 0;
	function changeStat() {
		var statNumberArray = [
			"48",
			"36",
			"6",
			];
		var statDescriptionArray = [
			"COUNTRIES",
			"U.S. STATES",
			"CONTINENTS",
			];
		var tempStatLength = statNumberArray.length - 1;

		TweenMax.set( "#nav-stats", { transformPerspective: 800 });

		var statAnimation =  new TimelineMax({ paused: true, force3D: true, repeat: -1, delay: 1, repeatDelay: 0 });
		statAnimation.to( "#nav-stats", 1.5, { scaleX: 0.7, scaleY: 0.7, autoAlpha: 0, rotationY: -90, ease: Expo.easeIn, immediateRender: false }, 0 );
		statAnimation.fromTo( "#nav-stats", 3,
			{ scaleX: 0, scaleY: 0, autoAlpha: 0, rotationY: 180 },
			{ scaleX: 1, scaleY: 1, autoAlpha: 1, rotationY: 0, ease: Expo.easeOut, immediateRender: false , onStart: function() {
				statNumber++;
				if (statNumber > tempStatLength){
					statNumber = 0
				}
				$('#nav-stats .number').html('');
				$('#nav-stats .number').html(statNumberArray[statNumber]);
				$('#nav-stats .description').html('');
				$('#nav-stats .description').html(statDescriptionArray[statNumber]);
			}, onComplete: function() {
				$('#nav-stats').removeAttr("style")
			}}, 1.5 );
		statAnimation.timeScale(1);
		statAnimation.play();
	}



	var isInfoVisible = false;
	var infoSection = "";
	function toggleInfo(target) {

		TweenMax.set("#overlayRing svg", { rotation: -90, transformOrigin:"center center"});
		TweenMax.set(".close .circles", { rotation: -180, transformOrigin:"center center"});

		if (isInfoVisible) {
			isInfoVisible = false;
			var tl =  new TimelineMax({ paused: true } );
			tl.to( "#overlay", 0.5, { autoAlpha: 0, ease: Linear.easeNone }, 0);
			tl.staggerTo( "#overlayRing .svg-ring", 0.5, { drawSVG: "50% 50%", ease: Expo.easeInOut }, 0.25, 0 );
			tl.play(0);
		} else {
			infoSection = target;
			isInfoVisible = true;

			var tl =  new TimelineMax({ paused: true } );
			tl.fromTo( "#overlay", 0.5, { autoAlpha: 0 }, { autoAlpha: 1, display: 'block', ease: Linear.easeNone }, 0);
			tl.staggerFromTo( "#overlayRing .svg-ring", 2, { drawSVG: "50% 50%" }, { drawSVG: "0 100%", ease: Expo.easeInOut }, 0.25, 0 );
			tl.fromTo( "#" + target, 1, { autoAlpha: 0 }, { autoAlpha: 1, display: 'block', ease: Linear.easeNone }, 0.5 );
			tl.fromTo( "#overlayRing", 1, { autoAlpha: 0 }, { autoAlpha: 1, ease: Expo.easeOut }, 0.5 );
			tl.staggerFromTo( "#" + target + " .animate", 1, { y: 50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, ease: Expo.easeOut }, 0.1, 1);
			//tl.fromTo( ".close line", 1, { drawSVG: "50% 50%", stroke: "#FFFFFF", autoAlpha: 0 }, { drawSVG: "0 100%", stroke: colorPrimary, autoAlpha: 1, ease: Expo.easeInOut }, 1 );
			tl.fromTo( ".close .line1", 1, { attr:{ x1: 25, y1: 25, x2: 25, y2: 25 }, stroke: "#FFFFFF", autoAlpha: 0 }, { attr:{ x1: 0, y1: 0, x2: 50, y2: 50 }, stroke: colorPrimary, autoAlpha: 1, ease: Expo.easeInOut }, 1 );
			tl.fromTo( ".close .line2", 1, { attr:{ x1: 25, y1: 25, x2: 25, y2: 25 }, stroke: "#FFFFFF", autoAlpha: 0 }, { attr:{ x1: 0, y1: 50, x2: 50, y2: 0 }, stroke: colorPrimary, autoAlpha: 1, ease: Expo.easeInOut }, 1 );

			tl.play(0);
			generateGlitch();
		}
	}

	function getDifference(a, b) {
		return Math.abs(a - b)
	}

	// COLOR FUNCTIONS
	function checkIsBlack(dataPixel){
		if(dataPixel[0]==dataPixel[1] && dataPixel[1]==dataPixel[2] && dataPixel[2]===0 ){
			return true
		} else {
			return false;
		}
	}

	function shadeBlend(p,c0,c1) {
		var n=p<0?p*-1:p,u=Math.round,w=parseInt;
		if(c0.length>7){
			var f=c0.split(","),t=(c1?c1:p<0?"rgb(0,0,0)":"rgb(255,255,255)").split(","),R=w(f[0].slice(4)),G=w(f[1]),B=w(f[2]);
			return "rgb("+(u((w(t[0].slice(4))-R)*n)+R)+","+(u((w(t[1])-G)*n)+G)+","+(u((w(t[2])-B)*n)+B)+")"
		}else{
			var f=w(c0.slice(1),16),t=w((c1?c1:p<0?"#000000":"#FFFFFF").slice(1),16),R1=f>>16,G1=f>>8&0x00FF,B1=f&0x0000FF;
			return "#"+(0x1000000+(u(((t>>16)-R1)*n)+R1)*0x10000+(u(((t>>8&0x00FF)-G1)*n)+G1)*0x100+(u(((t&0x0000FF)-B1)*n)+B1)).toString(16).slice(1)
		}
	}

	function hexToRgb(hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}


	var cometTotal = 15;
	var cometRotation = 360/cometTotal;
	function createGlitch(callbackFn) {
		////TweenMax.set( ".cross", { stroke: "#FFFFFF", scaleX: 0, scaleY: 0, autoAlpha: 0 } );
		TweenMax.set( ".cross", { autoAlpha: 0 } );

		TweenMax.set("#pulseCircle1", { rotation: -180, transformOrigin:"center center" });

		$('#pulseComets').html('');
		for (var i=0; i < cometTotal; i++) {
			$('#pulseComets').prepend('<div class="pulseComet" id="pulseComet' + i + '"><div class="pulseTrail"></div><div class="pulseDot"></div></div>');
			TweenMax.set ( "#pulseComet" + i , { rotation: ( i * cometRotation ), transformOrigin: 'center bottom' });
		}

		if (callbackFn) {
			callbackFn();
		}
	}


	function generateExplosion() {
		console.log("EXPLOSION WOW OVERPOWERIN")
		var explosionAnimation =  new TimelineMax({ paused: true });
		explosionAnimation.fromTo( ringExplosionMesh.scale, 1, { x: 1, y: 1 }, { x: 3, y: 3, ease: Quint.easeOut }, 0 );
		explosionAnimation.fromTo( ringExplosionMesh.material, 0.25, { opacity: 0 }, { opacity: 1, ease: Linear.easeNone,
			onStart:function(){
				ringExplosionMesh.visible = true;
			}
		}, 0);
		explosionAnimation.fromTo( ringExplosionMesh.material, 0.75, { opacity: 1 }, { opacity: 0, immediateRender: false, ease: Linear.easeNone,
			onComplete:function(){
				ringExplosionMesh.visible = false;
			}
		}, 0.25);
		explosionAnimation.timeScale(1);
		explosionAnimation.play(0);
	}


	function generateGlitch() {
		/*
		if (gyroscopeCreated) {
			//var gyroscopeMeshArray1 = [gyroscopeMesh1.material, gyroscopeMesh2.material, gyroscopeMesh3.material, gyroscopeMesh4.material];
			//var gyroscopeMeshArray2 = [gyroscopeMesh1.rotation, gyroscopeMesh2.rotation, gyroscopeMesh3.rotation, gyroscopeMesh4.rotation];
			var gyroscopeMeshArray1 = [gyroscopeMesh1.material, gyroscopeMesh3.material, gyroscopeMesh2.material, gyroscopeMesh4.material];
			var gyroscopeMeshArray2 = [gyroscopeMesh1.rotation, gyroscopeMesh3.rotation, gyroscopeMesh2.rotation, gyroscopeMesh4.rotation];

			var gyroscopeAnimation =  new TimelineMax({ paused: true });
			gyroscopeAnimation.staggerFromTo( gyroscopeMeshArray1, 0.5, { opacity: 1 }, { opacity: 0,  immediateRender: false, ease: Linear.easeNone }, 0.1, 0.5 );
			gyroscopeAnimation.staggerFromTo( gyroscopeMeshArray1, 0.5, { opacity: 0 }, { opacity: 1, ease: Linear.easeNone }, 0.1, 0 );
			gyroscopeAnimation.staggerFromTo( gyroscopeMeshArray2, 1, { x: 0 * toRAD }, { x: 180 * toRAD, ease: Power2.easeInOut }, 0.1, 0 );
			gyroscopeAnimation.timeScale(0.5);
			gyroscopeAnimation.play(0);
		}
		*/
		if (minimapBgCreated) {
			// && colorTypeCurrent != "cycle"
			var minimapAnimation =  new TimelineMax({ paused: true });
			minimapAnimation.to( minimapDetails, 2,  { pixi:{ tint: colorPrimary } }, 0 );
			minimapAnimation.fromTo( minimapLines, 2, { pixi:{ tint: 0xFFFFFF }}, { pixi:{ tint: colorPrimary }, ease: Circ.easeOut }, 0 );
			minimapAnimation.fromTo( minimapMaskGradient, 2, { pixi:{ scaleX: 0 }}, { pixi:{ scaleX: 1.25 }, ease: Expo.easeOut }, 0 );
			minimapAnimation.fromTo( minimapSpiral, 2, { pixi:{ rotation: 90 }}, { pixi:{ rotation: 450 }, ease: Expo.easeOut}, 0 );
			minimapAnimation.fromTo( minimapSpiral, 0.1, { pixi:{ alpha: 0 }}, { pixi:{ alpha: 1 }, immediateRender: false, ease: Linear.easeNone }, 0 );
			minimapAnimation.fromTo( minimapSpiral, 0.75, { pixi:{ alpha: 1 }}, { pixi:{ alpha: 0 }, immediateRender: false, ease: Linear.easeNone }, 0.2 );
			minimapAnimation.fromTo( minimapMaskGradient, 2, { pixi:{ alpha: 1 }}, { pixi:{ alpha: 0 }, ease: Linear.easeNone }, 0.5 );
			minimapAnimation.fromTo( minimapBlipsGroup, 0.65, { pixi:{ scale: 0 }}, { pixi:{ scale: 1 }, ease: Expo.easeOut}, 0);
			minimapAnimation.fromTo( minimapBlipArray, 0.75, { pixi:{ alpha: 1 }}, { pixi:{ alpha: 0 }, ease: Linear.easeNone}, 0.5);
			minimapAnimation.fromTo( minimapSpikesGroup, 0.75, { pixi:{ scale: 0 }}, { pixi:{ scale: 1 }, ease: Expo.easeOut}, 0);
			minimapAnimation.fromTo( minimapXArray, 0.75, { pixi:{ scaleY: 1 }}, { pixi:{ scaleY: 0 }, ease: Circ.easeInOut}, 0.1);
			minimapAnimation.fromTo( minimapExtras1, 3, { pixi:{ rotation: 0 }}, { pixi:{ rotation: -360 }, ease: Expo.easeOut}, 0 );
			minimapAnimation.fromTo( minimapExtras1, 0.1, { pixi:{ alpha: 0 }}, { pixi:{ alpha: 1 }, ease: Linear.easeNone }, 0 );
			minimapAnimation.fromTo( minimapExtras1, 1, { pixi:{ alpha: 1, tint: 0xFFFFFF }}, { pixi:{ alpha: 0, tint: colorPrimary }, immediateRender: false, ease: Linear.easeNone }, 0.2 );

			minimapAnimation.fromTo( minimapExtras2, 1.5, { pixi:{ scale: 0.50 }}, { pixi:{ scale: 1.1 }, ease: Expo.easeOut}, 0 );
			minimapAnimation.fromTo( minimapExtras2, 0.1, { pixi:{ alpha: 0 }}, { pixi:{ alpha: 0.5 }, ease: Linear.easeNone }, 0 );
			minimapAnimation.fromTo( minimapExtras2, 1, { pixi:{ alpha: 0.5, tint: 0xFFFFFF }}, { pixi:{ alpha: 0, tint: colorPrimary }, immediateRender: false, ease: Linear.easeNone }, 0.2 );

			minimapAnimation.fromTo( minimapXArray, 1, { pixi:{ tint: 0xFFFFFF }}, { pixi:{ tint: colorPrimary }, ease: Linear.easeNone }, 0 );
			minimapAnimation.fromTo( minimapBlipArray, 1, { pixi:{ tint: 0xFFFFFF }}, { pixi:{ tint: colorPrimary }, ease: Linear.easeNone }, 0 );

			minimapAnimation.timeScale(1.5);
			minimapAnimation.play(0);
		}

		//TweenMax.fromTo( ".cross", 0.5, { drawSVG: "0% 100%" }, { drawSVG: "50% 50%", ease: Expo.easeOut } );
		////TweenMax.fromTo( ".cross", 0.5, { scaleX: 0.5, scaleY: 0.5 }, { scaleX: 0, scaleY: 0, transformOrigin: 'center center', ease: Expo.easeOut } );
		////TweenMax.fromTo( ".cross", 0.5, { autoAlpha: 1 }, { autoAlpha: 0, ease: RoughEase.ease.config({ strength: 5, points: 50 }) });
		////TweenMax.fromTo( "#bracket-left", 2, { drawSVG: "21% 29%" }, { drawSVG: "20% 30%", ease: Expo.easeOut } );
		////TweenMax.fromTo( "#bracket-right", 2, { drawSVG: "71% 79%" }, { drawSVG: "70% 80%", ease: Expo.easeOut } );

		TweenMax.fromTo( "#interactive", .25, { x: generateRandomNumber(-10, 10), y: generateRandomNumber(-10, 10) }, { x: 0, y: 0, ease: RoughEase.ease.config({ strength: 2, points: 20 }) });

		//TweenMax.fromTo( "#cross1", 0.5, { attr:{ x1: 150, y1: 150, x2: 850, y2: 850 } }, { attr:{ x1: 500, y1: 500, x2: 500, y2: 500 }, ease: Expo.easeOut } );
		//TweenMax.fromTo( "#cross2", 0.5, { attr:{ x1: 150, y1: 850, x2: 850, y2: 150 } }, { attr:{ x1: 500, y1: 500, x2: 500, y2: 500 }, ease: Expo.easeOut } );
		//TweenMax.fromTo( ".cross", 0.5, { autoAlpha: 1 }, { autoAlpha: 0, ease: RoughEase.ease.config({ strength: 5, points: 50 }) });


		var glitcherAnimation =  new TimelineMax({ paused: true, force3D: true});
		glitcherAnimation.set( "#glitcher", { autoAlpha: 1, display: "block" });
		glitcherAnimation.fromTo( $('#glitcher'), 0.25,{
			x: generateRandomNumber(-15,15), y: generateRandomNumber(-15,15) }, {
			x: 0, y: 0, ease: RoughEase.ease.config({ strength: 5, points: 50 }) }, 0 );
		glitcherAnimation.set( $('#glitcher .minibar'), {
			left: generateRandomNumber(0,90) + "%",
			top: generateRandomNumber(0,90) +"%",
			width: "25%", height: 15, autoAlpha: 1, ease: Linear.easeNone }, 0 );  //, autoAlpha: (generateRandomNumber(25,100)/100)
		glitcherAnimation.set( $('#glitcher .minibar'), {
			left: generateRandomNumber(0,90) + "%",
			top: generateRandomNumber(0,90) +"%",
			width: "25%", height: 8, ease: Linear.easeNone }, .05 );
		glitcherAnimation.set( $('#glitcher .minibar'), {
			left: generateRandomNumber(0,90) + "%",
			top: generateRandomNumber(0,90) +"%",
			width: "10%", height: 5, ease: Linear.easeNone }, .1 );
		glitcherAnimation.set( $('#glitcher .minibar'), {
			left: generateRandomNumber(0,90) + "%",
			top: generateRandomNumber(0,90) +"%",
			width: "15%", height: 5, ease: Linear.easeNone }, .15 );
		glitcherAnimation.set( $('#glitcher .minibar'), {
			left: generateRandomNumber(0,90) + "%",
			top: generateRandomNumber(0,90) +"%",
			width: "35%", height: 1, ease: Linear.easeNone }, .2 );
		glitcherAnimation.set( $('#glitcher .minibar'), {
			left: generateRandomNumber(0,90) + "%",
			top: generateRandomNumber(0,90) +"%",
			width: "10%", height: 8, ease: Linear.easeNone }, .25 );
		glitcherAnimation.set( $('#glitcher .minibar'), {
			left: generateRandomNumber(0,90) + "%",
			top: generateRandomNumber(0,90) +"%",
			width: "25%", height: 8, ease: Linear.easeNone }, .3 );
		glitcherAnimation.set( $('#glitcher .minibar'), { autoAlpha: 0 }, .35 );
		//glitcherAnimation.set( "#glitcher .microtext", { autoAlpha: 0, display: "none", immediateRender: false }, 1);
		glitcherAnimation.set( "#glitcher", { autoAlpha: 0, display: "none", immediateRender: false }, 1);

		glitcherAnimation.timeScale(1.5);
		glitcherAnimation.play(0);

		generateExplosion();
	}

	// GENERATE RANDOM NUMBER
	function generateRandomNumber(min, max) {
		var random = Math.floor(Math.random() * (max - min + 1)) + min;
		return random;
	}

	// RESIZE CODE
	function onWindowResize() {
		var width = window.innerWidth;
		var height = window.innerHeight;
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize( width, height );
	}

	// MOUSE WHEEL AND MOVEMENT
	function onMouseWheel(event) {
		event.preventDefault();
		targetCameraZ -= event.wheelDeltaY * 0.05;
	}

	function onDocumentMouseDown( event ) {
		if ( isGlobeEventsEnabled === false ) return;
		event.preventDefault();
		isMouseDown = true;

		mouseXOnMouseDown = event.clientX - windowHalfX;
		mouseYOnMouseDown = event.clientY - windowHalfY;

		targetRotationXOnMouseDown = targetRotationX;
		targetRotationYOnMouseDown = targetRotationY;

		checkClick();

		initMouseX = event.clientX;
	}

	var targetTiltX = 0;
	var targetTiltY = 0;

	function onDocumentMouseMove( event ) {
		if ( isGlobeEventsEnabled === false ) return;
		isMouseMoved = true;
		clientMouseX = event.clientX;
		clientMouseY = event.clientY;

		if (isParticleHit) {
			if (clientMouseX > (window.innerWidth - 250)) {
				TweenMax.set( "#tooltip", { left: 'auto', right: (window.innerWidth - clientMouseX) + 35, top: clientMouseY });
			} else {
				TweenMax.set( "#tooltip", { right: 'auto', left: clientMouseX + 35, top: clientMouseY });
			}
		}

		if (isMediaHit) {
			if (clientMouseX > (window.innerWidth - 250)) {
				TweenMax.set( "#tooltip", { left: 'auto', right: (window.innerWidth - clientMouseX) + 35, top: clientMouseY });
			} else {
				TweenMax.set( "#tooltip", { right: 'auto', left: clientMouseX + 35, top: clientMouseY });
			}
		}

		mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

		if (isMouseDown) {
			isGlobeRotated = true;
			mouseX = event.clientX - windowHalfX;
			mouseY = event.clientY - windowHalfY;
			targetRotationX = targetRotationXOnMouseDown + ( mouseY - mouseYOnMouseDown ) * 0.0025;
			targetRotationY = targetRotationYOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.0025;
		}

		var centerX = window.innerWidth * 0.5;
		var centerY = window.innerHeight * 0.5;
		targetTiltY = (event.clientX - centerX) / centerX * 0.005;
		targetTiltX = (event.clientY - centerY) / centerY * 0.01;
	}

	function onDocumentMouseUp( event ) {
		if ( isGlobeEventsEnabled === false ) return;
		event.preventDefault();
		isMouseDown = false;
		if (Math.abs(initMouseX - event.clientX) < 25) return;
		setRotation("off");
		setCameraDirection(initMouseX, event.clientX);
	}

	function onDocumentMouseLeave( event ) {
		if ( isGlobeEventsEnabled === false ) return;
		event.preventDefault();
		if (isMouseDown) {
			isMouseDown = false;
			if (Math.abs(initMouseX - event.clientX) < 25) return;
			setRotation("off");
			setCameraDirection(initMouseX, event.clientX);
		}
	}

	function setCameraDirection(startX, endX) {
		if (startX > endX ) {
			cameraDirection = "right";
		} else {
			cameraDirection = "left";
		}
	}


	// TOUCH
	var _touchZoomDistanceStart,
		_touchZoomDistanceEnd;
	function onDocumentTouchStart( event ) {
		if ( isGlobeEventsEnabled === false ) return;
		if ( event.touches.length == 1 ) {
			event.preventDefault();
			isMouseDown = true;

			mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
			mouseYOnMouseDown = event.touches[ 0 ].pageY - windowHalfY;

			targetRotationXOnMouseDown = targetRotationX;
			targetRotationYOnMouseDown = targetRotationY;
		}

		if ( event.touches.length > 1 ) {
			var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
			var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
			_touchZoomDistanceEnd = _touchZoomDistanceStart = Math.sqrt( dx * dx + dy * dy );
		}
	}

	function onDocumentTouchMove( event ) {
		if ( isGlobeEventsEnabled === false ) return;
		if ( event.touches.length == 1 ) {
			event.preventDefault();
			if (isMouseDown) {
				isGlobeRotated = true;
				mouseX = mouseX = event.touches[ 0 ].pageX - windowHalfX;
				mouseY = mouseY = event.touches[ 0 ].pageY - windowHalfY;

				if ( targetCameraZ < (globeMaxZoom + 50) ){
					targetRotationX = targetRotationXOnMouseDown + ( mouseY - mouseYOnMouseDown ) * 0.001;
					targetRotationY = targetRotationYOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.001;
				} else {
					targetRotationX = targetRotationXOnMouseDown + ( mouseY - mouseYOnMouseDown ) * 0.01;
					targetRotationY = targetRotationYOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.01;
				}

			}
			//lastTouchX = event.clientX = event.touches[0].clientX;
			//lastTouchY = event.clientY = event.touches[0].clientY;
		}

		if ( event.touches.length > 1 ) {
           var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
           var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
           _touchZoomDistanceEnd = Math.sqrt( dx * dx + dy * dy );

			var factor = _touchZoomDistanceStart / _touchZoomDistanceEnd;
			if (_touchZoomDistanceEnd > _touchZoomDistanceStart) {
				targetCameraZ -= factor * 5;
			} else {
				targetCameraZ += factor * 5;
			}
			_touchZoomDistanceStart = _touchZoomDistanceEnd;
		}
	}

	function onDocumentTouchEnd( event ) {
		_touchZoomDistanceStart = _touchZoomDistanceEnd = 0;
		//isMouseDown = false;
		//event.clientX = lastTouchX;
		//event.clientY = lastTouchY;
		setRotation("off");
		onDocumentMouseUp(event);
	}



	// MAP DATA
	// NUMBER, BOOK TYPE, LAT, LON, LOCATION
	var dataMap = [
		// SHOPIFY
		[180,2,55.154,61.421,"\n CHELYABINSK, RUSSIA"],
		[180,2,55.753,37.620,"\n MOSCOW, RUSSIA"],
		[180,2,31.47,35.14,"\n Jerusalem, ISRAEL"]
  ];

$(document).ready(initWebgl);
