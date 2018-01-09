// BTBP example setup and handling:
//
// Init everything:
// + image data (either webcam or picture)
// + BTBP SDK with the size of the image data
// + Set all the parameters for BTBP according to the chosen example
// + Reinit if image data size changes

(function() {
	"use strict";

	var example		= btbpExample;

	var imageData	= example.imageData;
	var dom			= example.dom;
	var stats		= example.stats;
	var drawing		= example.drawing;
	var t3d			= example.drawing3d.t3d;
	var trace		= example.trace;

	var btbpManager	= null;
	var resolution	= null;

	var paused		= true;

	// This call initializes the library and put's all necessary date in RAM.
	initializeBTBP(btbpv4);

	// Tell the DrawingUtils where to draw to.
	if(drawing.setup && !drawing.stage) {
		drawing.setup(dom.getElement("_drawing"), dom.getElement("_faceSub"), 30);
	}

	// FPS meter
	if(stats.init) {
		stats.init(30);
	}

	// On imageData switch (webcam/picture) BTBP needs to reinit with the correct image sizes.
	example.reinit = function() {
		example.init(imageData.type());
	};

	// imageData available? Then update layout and reinit BTBP.
	imageData.onAvailable = function(width, height) {

		trace("imageData.onAvailable: " + width + "x" + height);

		dom.updateLayout(width, height);
		resolution.setTo(0, 0, width, height);
		drawing.updateLayout(width, height);

		example.reinit();
	};

	// If the SDK didn't load yet (sdkReady is false) wait for it to do so.
	example.waitForSDK = function() {

		if(btbpv4.sdkReady) {

			trace("waitForSDK: done.");
			example.init();

		} else {

			trace("waitForSDK: still waiting.");
			clearTimeout(example.waitForSDK_timeout);
			example.waitForSDK_timeout = setTimeout(function() {
				example.waitForSDK();
			}, 100);
		}
	};

	// Setup BRF and the imageData by chosen type (webcam/picture).
	example.init = function(type) {

		paused = true;

		if(imageData.type && type !== imageData.type() && imageData.isAvailable()) {
			drawing.setUpdateCallback(null);
			trace("imageData.dispose: " + imageData.type());
			imageData.dispose();
		}

		trace("init: type: " + type);

		if(!btbpv4.sdkReady) {

			example.waitForSDK();

		} else {

			trace("-> btbpv4.sdkReady: " + btbpv4.sdkReady);

			if(btbpv4.BTBPManager && !btbpManager) {
				btbpManager	= new btbpv4.BTBPManager();
			}
			if(btbpv4.Rectangle && !resolution) {
				resolution	= new btbpv4.Rectangle(0, 0, 640, 480);
			}
			if(btbpManager === null || resolution === null) {
				trace("Init failed!", true);
				return;
			}

			if(type === "picture") {	// Start either using an image ...

				imageData.picture.setup(
					dom.getElement("_imageData"),
					imageData.onAvailable
				);

			} else {				// ... or start using the webcam.

				imageData.webcam.setup(
					dom.getElement("_webcam"),
					dom.getElement("_imageData"),
					resolution,
					imageData.onAvailable
				);
			}

			trace("-> imageData.isAvailable (" + imageData.type() + "): " + imageData.isAvailable());

			if(imageData.isAvailable()) {

				setupBRFExample();

			} else {

				resolution.setTo(0, 0, 640, 480); // reset for webcam initialization
				imageData.init();
			}
		}
	};

	function setupBRFExample() {

		//document.getElementById("_lipshades").style.display = "block";
		//document.getElementById("_foundationshades").style.display = "block";
		// Remove clicks and image overlay as well as 3d models.

		drawing.clickArea.mouseEnabled = false;
		drawing.imageContainer.removeAllChildren();
		if(t3d && t3d.hideAll) t3d.hideAll();

		// Reset BTBP to it's default parameters.
		// Every example may change these according to
		// its own needs in initCurrentExample().

		var size = resolution.height;

		if(resolution.height > resolution.width) {
			size = resolution.width;
		}

		btbpManager.setMode(btbpv4.BTBPMode.FACE_TRACKING);
		btbpManager.setNumFacesToTrack(1);

		btbpManager.setFaceDetectionRoi(resolution);

		// more strict

		btbpManager.setFaceDetectionParams(		size * 0.30, size * 1.00, 12, 8);
		btbpManager.setFaceTrackingStartParams(	size * 0.30, size * 1.00, 22, 26, 22);
		btbpManager.setFaceTrackingResetParams(	size * 0.25, size * 1.00, 40, 55, 32);

		// less strict

		// btbpManager.setFaceDetectionParams(		size * 0.20, size * 1.00, 12, 8);
		// btbpManager.setFaceTrackingStartParams(	size * 0.20, size * 1.00, 32, 46, 32);
		// btbpManager.setFaceTrackingResetParams(	size * 0.15, size * 1.00, 40, 55, 32);

		// Initialize the example. See the specific files in js/examples

		example.initCurrentExample(btbpManager, resolution, drawing);

		paused = false;

		if(imageData.isStream()) {

			// webcam continuous update.

			drawing.setUpdateCallback(updateBRFExample);

		} else {

			// Simply update 10 times for loaded images.
			// This is not the most sophisticated approach, but
			// will most likely do the job.

			drawing.clear();

			var imageDataCanvas	= dom.getElement("_imageData");

			imageData.update();				// depends on whether it is a webcam or image setup

			var data = imageDataCanvas.getContext("2d").getImageData(0, 0, resolution.width, resolution.height).data;

			for(var i = 0; i < 10; i++) {
				btbpManager.update(data);
			}

			setTimeout(function() {
				example.updateCurrentExample(	// depends on the chosen example
					btbpManager, data, drawing
				);
			}, 100);

		}
	}

	function updateBRFExample() {

		if(!paused) {

			if (stats.start) stats.start();

			var imageDataCanvas	= dom.getElement("_imageData");

			imageData.update();				// depends on whether it is a webcam or image setup

			example.updateCurrentExample(	// depends on the chosen example
				btbpManager,
				imageDataCanvas.getContext("2d").getImageData(0, 0, resolution.width, resolution.height).data,
				drawing
			);

			if (stats.end) stats.end();
		}
	}
})();