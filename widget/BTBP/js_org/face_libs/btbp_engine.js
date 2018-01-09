(function exampleCode() {
	"use strict";
	var _extendedShape = new btbpv4.BTBPExtendedFace();
	var settings=btbpExample.settings;
	var features = btbpExample.features;
	var _imageData = btbpExample.dom.getElement("_imageData");
	var faceCounter = 0;
	btbpExample.initCurrentExample = function (btbpManager, resolution) {
		btbpManager.init(resolution, resolution, btbpExample.appId);
	};

	var startTime = new Date();
	btbpExample.updateCurrentExample = function (btbpManager, imageData, draw) {

		if(!btbpExample.config.isStarted)
		{
			return;
		}
		btbpManager.update(imageData);

		draw.clear();

		// Face detection results: a rough rectangle used to start the face tracking.

		/*
		draw.drawRects(btbpManager.getAllDetectedFaces(),	false, 1.0, 0x00a1ff, 0.5);
		draw.drawRects(btbpManager.getMergedDetectedFaces(),	false, 2.0, 0xffd200, 1.0);
		*/
		var faces = btbpManager.getFaces(); // default: one face, only one element in that array.

		for (var i = 0; i < faces.length; i++) {

			var face = faces[i];

			if (face.state === btbpv4.BTBPState.FACE_TRACKING_START ||
				face.state === btbpv4.BTBPState.FACE_TRACKING) {
				_extendedShape.update(face);
				var vertices = _extendedShape.vertices;
				var triangles = _extendedShape.triangles;
				var bounds = getFaceAndLipBounds(vertices);
				var faceBounds = { x: bounds[0], y: bounds[1], width: bounds[2], height: bounds[3] };
				
				var faceWidth = bounds[2];
				var faceHeight = bounds[3];

				var width = _imageData.width;
				var height = _imageData.height;
				var imageMinDim = Math.min(width , height);
				
				var imageArea = imageMinDim * imageMinDim;
				var faceArea = faceWidth * faceHeight;

				var percentageArea = (faceArea/imageArea) * 100;
				//console.log("percentageArea :"+percentageArea);
				if(percentageArea <= 18)
				{
					onFaceNotDetected();
					return;
				}
				startTime = new Date();
				if (settings.FLDPoints) {
					draw.drawVertices(vertices, 2.0, false, 0x00a0ff, 0.4);
				}

				if (settings.FLDTriangles) {
					draw.drawTriangles(vertices, triangles, false, 1.0, 0x00a0ff, 0.4);
				}

			
				if (settings.Foundation) {
					var faceBounds = { x: bounds[0], y: bounds[1], width: bounds[2], height: bounds[3] };
					draw.drawFoundation(_imageData, faceBounds, vertices, false, settings.Complexion);
				}
				else if (settings.Complexion) {
					var faceBounds = { x: bounds[0], y: bounds[1], width: bounds[2], height: bounds[3] };
					draw.drawComplexion(_imageData, faceBounds, vertices, false);
				}

				if (settings.Lipstick) {
					var lipBounds = { x: bounds[4], y: bounds[5], width: bounds[6], height: bounds[7] };
					draw.drawLipStick(_imageData, lipBounds, vertices, false);
				}

				if(!settings.isAnalysisStated)
				{
					faceCounter++;
					if(faceCounter > 30)
					{
						startAnalysis(_imageData);
						//showImagePreviewFromCanvas(_imageData);
						settings.isAnalysisStated = true;
						faceCounter = 0;
					}
				
				}
			}
			else {
				onFaceNotDetected();
			}
		}
	};

	function onFaceNotDetected()
	{
		faceCounter = 0;
		
		var width = _imageData.width;
		var height = _imageData.height;
		var size = height;
		if (height > width) {
			size = width;
		}
		var w = size * 0.40;
		var h = size * 0.50;
		var x = (width - w) *0.5;
		var y = (height - h) *0.5;
		var rect = new btbpv4.Rectangle(x, y, w, h);
		var thickness = size * 0.005;
		btbpExample.drawing.drawRect(rect, false, thickness, 0xff0000, 1.0);

		if(btbpExample.config.isAutoRest)
		{
			var endTime = new Date();
			var milliSeconds = (endTime - startTime) ;// / 1000;
			//console.log(milliSeconds);
			if(milliSeconds > btbpExample.config.resetTimeout)
			{
				startTime = new Date();
				btbpExample.callbacks.resetApp();
			}
		}

		
	}

	function showImagePreviewFromCanvas(canvas) {
		// var imageEle = document.getElementById('previewImage');
		var imageEle = document.createElement('img');
		imageEle.src = canvas.toDataURL('image/jpeg', 1.0);
		document.body.appendChild(imageEle);
	}

	//btbpExample.dom.updateHeadline("BTBP - intermediate - face tracking - color libs.\n" +"Draws triangles with a certain fill color.");

	btbpExample.dom.updateCodeSnippet(exampleCode + "");

	function getFaceAndLipBounds(vertices) {
		var bounds = [];
		//face bounds
		var minX = vertices[0];
		var minY = vertices[1];
		var maxX = vertices[0];
		var maxY = vertices[1];
		var l = vertices.length, value;

		for (var i = 2; i < l; i++) {
			value = vertices[i];
			if ((i % 2) === 0) {
				if (value < minX) minX = value;
				if (value > maxX) maxX = value;
			} else {
				if (value < minY) minY = value;
				if (value > maxY) maxY = value;
			}
		}
		var kernalFace = parseInt((maxX - minX) * 0.04);
		if (kernalFace % 2 == 0)
			kernalFace++;
		if (kernalFace < 3)
			kernalFace = 3;
		features.kernalFace = kernalFace;
		features.kernalComplexion = 5;
		
		var kernalForehead = parseInt(2.5 * kernalFace);
		if (kernalForehead % 2 == 0)
			kernalForehead++;
		features.kernalForehead = kernalForehead;
		var kernalEyebrow = parseInt(1.8 * kernalFace);
		if (kernalEyebrow % 2 == 0)
			kernalEyebrow++;
		features.kernalEyebrow = kernalEyebrow;
		//console.log(btbpExample.drawingBTBP.kernalFace + "," + btbpExample.drawingBTBP.kernalEyebrow + "," + btbpExample.drawingBTBP.kernalForehead);
		//padding rectangle to accomdate highest kernal.
		var offset = kernalForehead;
		bounds[0] = parseInt(minX - offset);
		bounds[1] = parseInt(minY - offset);//to accomdate kernal at forehead.
		bounds[2] = parseInt(maxX + offset - bounds[0] + 1);
		bounds[3] = parseInt(maxY + offset - bounds[1] + 1);

		//lip bounds
		minX = vertices[96];/*48X*/
		minY = vertices[97];/*48Y*/
		maxX = vertices[96];
		maxY = vertices[97];
		for (var i = 98/*49X*/; i <= 119/*59Y*/; i++) {
			value = vertices[i];
			if ((i % 2) === 0) {
				if (value < minX) minX = value;
				if (value > maxX) maxX = value;
			} else {
				if (value < minY) minY = value;
				if (value > maxY) maxY = value;
			}
		}
		var kernalLip = parseInt((maxX - minX) * 0.04 * 3 * settings.LipIntensity);
		if (kernalLip % 2 == 0)
			kernalLip++;
		if (kernalLip < 3)
			kernalLip = 3;
		features.kernalLip = kernalLip;
		//padding rectangle to accomdate highest kernal.
		offset = Math.max(kernalFace, kernalLip);//kernalFace is used for glossy effect
		bounds[4] = parseInt(minX - offset);
		bounds[5] = parseInt(minY - offset);
		bounds[6] = parseInt(maxX + offset - bounds[4] + 1);
		bounds[7] = parseInt(maxY + offset - bounds[5] + 1);
		return bounds;
	}

})();