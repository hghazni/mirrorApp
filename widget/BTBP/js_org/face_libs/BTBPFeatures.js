// logics for btbp features
(function () {
	"use strict";

	var features = btbpExample.features;
	features.kernalFace;
	features.kernalComplexion;
	features.kernalForehead;
	features.kernalEyebrow;
	features.kernalLip;
	var maskCanvas2;
	var locations={
		nose:0,forehead:0,eyebrow:0
	};
	var settings=btbpExample.settings;

	function getFoundationMask(width, height, vertices) {
		var maskCanvas = document.createElement("canvas");//document.getElementById("_mask");
		var maskCtx = maskCanvas.getContext("2d");
		maskCanvas.width = width;
		maskCanvas.height = height;
		maskCtx.fillRect(0, 0, width, height);

		//fill face mask
		maskCtx.fillStyle = "white";
		maskCtx.beginPath();
		maskCtx.moveTo(vertices[0 * 2], vertices[0 * 2 + 1]);
		for (var i = 1; i <= 16; i++) {
			maskCtx.lineTo(vertices[i * 2], vertices[i * 2 + 1]);
		}
		for (var i = 73; i >= 68; i--) {
			maskCtx.lineTo(vertices[i * 2], vertices[i * 2 + 1]);
		}
		maskCtx.lineTo(vertices[0 * 2], vertices[0 * 2 + 1]);
		maskCtx.fill();

		//remove lip ROI
		maskCtx.fillStyle = "black";
		maskCtx.beginPath();
		maskCtx.moveTo(vertices[48 * 2], vertices[48 * 2 + 1]);
		for (var i = 49; i <= 59; i++) {
			maskCtx.lineTo(vertices[i * 2], vertices[i * 2 + 1]);
		}
		maskCtx.lineTo(vertices[48 * 2], vertices[48 * 2 + 1]);

		//remove left eye ROI
		maskCtx.moveTo(vertices[17 * 2], vertices[17 * 2 + 1]);
		for (var i = 18; i <= 21; i++) {
			maskCtx.lineTo(vertices[i * 2], vertices[i * 2 + 1]);
		}
		var eyePoint = (vertices[37 * 2 + 1] + vertices[38 * 2 + 1]) *0.5;
		for (var i = 21; i >= 17; i--) {
			maskCtx.lineTo(vertices[i * 2], vertices[i * 2 + 1] + (0.33 * (eyePoint - vertices[i * 2 + 1])));
		}
		maskCtx.lineTo(vertices[17 * 2], vertices[17 * 2 + 1]);
		maskCtx.moveTo(vertices[36 * 2], vertices[36 * 2 + 1]);
		for (var i = 37; i <= 41; i++) {
			maskCtx.lineTo(vertices[i * 2], vertices[i * 2 + 1]);
		}
		maskCtx.lineTo(vertices[36 * 2], vertices[36 * 2 + 1]);

		//remove right eye ROI
		maskCtx.moveTo(vertices[22 * 2], vertices[22 * 2 + 1]);
		for (var i = 23; i <= 26; i++) {
			maskCtx.lineTo(vertices[i * 2], vertices[i * 2 + 1]);
		}
		eyePoint = (vertices[43 * 2 + 1] + vertices[44 * 2 + 1]) *0.5;
		for (var i = 26; i >= 22; i--) {
			maskCtx.lineTo(vertices[i * 2], vertices[i * 2 + 1] + (0.33 * (eyePoint - vertices[i * 2 + 1])));
		}
		maskCtx.lineTo(vertices[22 * 2], vertices[22 * 2 + 1]);
		maskCtx.moveTo(vertices[42 * 2], vertices[42 * 2 + 1]);
		for (var i = 43; i <= 47; i++) {
			maskCtx.lineTo(vertices[i * 2], vertices[i * 2 + 1]);
		}
		maskCtx.lineTo(vertices[42 * 2], vertices[42 * 2 + 1]);
		maskCtx.fill();
		locations.nose = vertices[33 * 2 + 1];
		locations.forehead = (vertices[68 * 2 + 1] + vertices[73 * 2 + 1]) * 0.5;
		locations.eyebrow = (vertices[17 * 2 + 1] + vertices[26 * 2 + 1]) * 0.5;
		return maskCanvas;
	};

	features.applyFoundation = function (inputCanvas, outputCanvas, bounds, vertices, isComplexion) {
		var maskCanvas = getFoundationMask(inputCanvas.width, inputCanvas.height, vertices);
		var maskCtx = maskCanvas.getContext("2d");
		var inputCtx = inputCanvas.getContext("2d");
		var outputCtx = outputCanvas.getContext("2d");

		var x = bounds.x;
		var y = bounds.y;

		var inputImageData = inputCtx.getImageData(x, y, bounds.width, bounds.height);
		var inputPixels = inputImageData.data;
		var maskImageData = maskCtx.getImageData(x, y, bounds.width, bounds.height);
		var maskPixels = maskImageData.data;

		var width = inputImageData.width;
		var height = inputImageData.height;

		locations.forehead -= y;
		locations.eyebrow -= y;
		blurFoundationMask(width, height, maskPixels);
		//maskCtx.putImageData(maskImageData, 60, 0);
		var inputPixelsCopy = inputPixels.slice();
		var maskPixelsComplexion;
		if (isComplexion) {
			var maskCanvas2 = getComplexionMask(inputCanvas.width, inputCanvas.height, vertices);
			var maskCtx2 = maskCanvas2.getContext("2d");
			var maskImageDataComplexion = maskCtx2.getImageData(x, y, bounds.width, bounds.height);
			maskPixelsComplexion = maskImageDataComplexion.data;
			blurComplexionMask(width, height, maskPixelsComplexion);
			blurRGB(width, height, inputPixelsCopy, features.kernalComplexion);
		}
		if (settings.MatchFoundation) {
			locations.nose -= y;
			var moustache = parseInt(locations.nose * width * 4);
			matchingFoundationColor(inputPixelsCopy, moustache, maskPixels);
			settings.MatchFoundation = false;
		}
		var color = settings.FoundationShade;
		var ratio0 = 1;
		var ratio1 = color[1] / color[0];
		var ratio2 = color[2] / color[0];
		var R, G, B, NR, NG, NB, sk, sk1;
		var length = inputPixels.length;
		var coverage = settings.FoundationIntensity;
		var complexionValue = settings.ComplexionIntensity * 3;
		var temp=1./255;
		for (var i = 0; i < length; i = i + 4) {
			sk = maskPixels[i] * coverage;
			if (sk > 0) {
				R = inputPixels[i];
				G = inputPixels[i + 1];
				B = inputPixels[i + 2];
				if (isComplexion) {
					sk1 = maskPixelsComplexion[i];
					if (sk1 > 0) {
						NR = complexionValue * (inputPixelsCopy[i] - R);
						if (NR < 0)
							NR = 0;
						NG = complexionValue * (inputPixelsCopy[i + 1] - G);
						if (NG < 0)
							NG = 0;
						NB = complexionValue * (inputPixelsCopy[i + 2] - B);
						if (NB < 0)
							NB = 0;
						NR += R;
						NG += G;
						NB += B;
						if (NR > 255)
							NR = 255;
						if (NG > 255)
							NG = 255;
						if (NB > 255)
							NB = 255;
						R = (R *temp * (255 - sk1)) + (NR  *temp * sk1);
						G = (G  *temp * (255 - sk1)) + (NG  *temp * sk1);
						B = (B  *temp * (255 - sk1)) + (NB  *temp * sk1);
					}
				}
				inputPixels[i] = (R  *temp * (255 - sk)) + (R * ratio0  *temp * sk);
				inputPixels[i + 1] = (G  *temp * (255 - sk)) + (R * ratio1  *temp * sk);
				inputPixels[i + 2] = (B  *temp * (255 - sk)) + (R * ratio2  *temp * sk);
			}
		}
		outputCtx.putImageData(inputImageData, x, y);
	};

	function matchingFoundationColor(inputPixels, moustache, maskPixels) {
		var colors = settings.foudataionShades;
		var length = inputPixels.length;
		var cnt = 0;
		var pixels = [];
		for (var i = 0; i < 256; i++) {
			pixels[i] = 0;
		}
		for (var i = 0; i < length; i = i + 4) {
			if (i < moustache && maskPixels[i] == 255) {
				pixels[inputPixels[i]]++;
				cnt++;
			}
		}
		var LowLimit = (cnt * 0.20);
		var highLimit = (cnt * 0.15);
		cnt = 0;
		var lowIntensity, highIntensity;
		for (var i = 0; i < 256; i++) {
			cnt += pixels[i];
			pixels[i] = 0;
			if (cnt > LowLimit) {
				lowIntensity = i;
				break;
			}
		}
		cnt = 0;
		for (var i = 255; i >= 0; i--) {
			cnt += pixels[i];
			pixels[i] = 0;
			if (cnt > highLimit) {
				highIntensity = i;
				break;
			}
		}
		cnt = 0;
		var R = 0, G = 0, B = 0, P = 0;
		for (var i = 0; i < length; i = i + 4) {
			P = inputPixels[i];
			if (i < moustache && maskPixels[i] == 255 && P > lowIntensity && P < highIntensity) {
				R += P;
				G += inputPixels[i + 1];
				B += inputPixels[i + 2];
				cnt++;
			}
		}
		if (cnt > 0) {
			R /= cnt;
			G /= cnt;
			B /= cnt;
		}
		var mindiff = Math.abs(R - colors[0][0]) + Math.abs(G - colors[0][1]) + Math.abs(B - colors[0][2]);
		var index = 0;
		for (var i = 1; i < colors.length; i++) {
			var diff = Math.abs(R - colors[i][0]) + Math.abs(G - colors[i][1]) + Math.abs(B - colors[i][2]);
			if (diff < mindiff) {
				mindiff = diff;
				index = i;
			}
		}

		settings.setFoundationShade(index);
		//console.log("R :" + R + "G : " + G + " B : " + B + " Count : " + cnt + " index :" + index+"lowI :"+lowIntensity+"highI :"+highIntensity);
	}

	function getComplexionMask(width, height, vertices) {
		var maskCanvas = document.createElement("canvas");//document.getElementById("_mask");
		var maskCtx = maskCanvas.getContext("2d");
		maskCanvas.width = width;
		maskCanvas.height = height;
		maskCtx.fillRect(0, 0, width, height);

		//fill face mask
		maskCtx.fillStyle = "white";
		maskCtx.beginPath();
		maskCtx.moveTo(vertices[0 * 2], vertices[0 * 2 + 1]);
		for (var i = 1; i <= 16; i++) {
			maskCtx.lineTo(vertices[i * 2], vertices[i * 2 + 1]);
		}
		for (var i = 73; i >= 68; i--) {
			maskCtx.lineTo(vertices[i * 2], vertices[i * 2 + 1]);
		}
		maskCtx.lineTo(vertices[0 * 2], vertices[0 * 2 + 1]);
		maskCtx.fill();

		//remove lip ROI
		maskCtx.fillStyle = "black";
		maskCtx.beginPath();
		var lipOffset1 = (vertices[33 * 2 + 1] - vertices[30 * 2 + 1]) * 0.8;
		maskCtx.moveTo(vertices[31 * 2], vertices[31 * 2 + 1] - lipOffset1);
		for (var i = 32; i <= 35; i++) {
			maskCtx.lineTo(vertices[i * 2], vertices[i * 2 + 1] - lipOffset1);
		}
		var lipOffset2 = (vertices[12 * 2] - vertices[54 * 2]) * 0.3;
		maskCtx.lineTo(vertices[54 * 2] + lipOffset2, vertices[54 * 2 + 1]);
		lipOffset2 = (vertices[8 * 2 + 1] - vertices[57 * 2 + 1]) * 0.3;
		for (var i = 55; i <= 59; i++) {
			maskCtx.lineTo(vertices[i * 2], vertices[i * 2 + 1] + lipOffset2);
		}
		lipOffset2 = (vertices[48 * 2] - vertices[4 * 2]) * 0.3;
		maskCtx.lineTo(vertices[48 * 2] - lipOffset2, vertices[48 * 2 + 1]);
		maskCtx.lineTo(vertices[31 * 2], vertices[31 * 2 + 1] - lipOffset1);

		//remove left eye ROI
		var eyebrowOffset = (vertices[19 * 2 + 1] - vertices[68 * 2 + 1]) * 0.5;
		maskCtx.moveTo(vertices[17 * 2], vertices[17 * 2 + 1] - eyebrowOffset);
		for (var i = 18; i <= 21; i++) {
			maskCtx.lineTo(vertices[i * 2], vertices[i * 2 + 1] - eyebrowOffset);
		}
		maskCtx.lineTo(vertices[39 * 2], vertices[39 * 2 + 1]);
		var eyeOffset = (vertices[30 * 2 + 1] - vertices[40 * 2 + 1]) * 0.4;
		for (var i = 40; i <= 41; i++) {
			maskCtx.lineTo(vertices[i * 2], vertices[i * 2 + 1] + eyeOffset);
		}
		maskCtx.lineTo(vertices[0 * 2], vertices[0 * 2 + 1]);
		maskCtx.lineTo(vertices[17 * 2], vertices[17 * 2 + 1] - eyebrowOffset);

		//remove right eye ROI
		eyebrowOffset = (vertices[24 * 2 + 1] - vertices[73 * 2 + 1]) * 0.5;
		maskCtx.moveTo(vertices[22 * 2], vertices[22 * 2 + 1] - eyebrowOffset);
		for (var i = 23; i <= 26; i++) {
			maskCtx.lineTo(vertices[i * 2], vertices[i * 2 + 1] - eyebrowOffset);
		}
		maskCtx.lineTo(vertices[16 * 2], vertices[16 * 2 + 1]);
		eyeOffset = (vertices[30 * 2 + 1] - vertices[46 * 2 + 1]) * 0.4;
		for (var i = 46; i <= 47; i++) {
			maskCtx.lineTo(vertices[i * 2], vertices[i * 2 + 1] + eyeOffset);
		}
		maskCtx.lineTo(vertices[42 * 2], vertices[42 * 2 + 1]);
		maskCtx.lineTo(vertices[22 * 2], vertices[22 * 2 + 1] - eyebrowOffset);
		maskCtx.fill();
		return maskCanvas;
	};

	features.applyComplexion = function (inputCanvas, outputCanvas, bounds, vertices) {
		var maskCanvas = getComplexionMask(inputCanvas.width, inputCanvas.height, vertices);
		var maskCtx = maskCanvas.getContext("2d");
		var inputCtx = inputCanvas.getContext("2d");
		var outputCtx = outputCanvas.getContext("2d");

		var x = bounds.x;
		var y = bounds.y;

		var inputImageData = inputCtx.getImageData(x, y, bounds.width, bounds.height);
		var inputPixels = inputImageData.data;
		var maskImageData = maskCtx.getImageData(x, y, bounds.width, bounds.height);
		var maskPixels = maskImageData.data;

		var width = inputImageData.width;
		var height = inputImageData.height;

		blurComplexionMask(width, height, maskPixels);
		//maskCtx.putImageData(maskImageData, 60, 0);
		var inputPixelsCopy = inputPixels.slice();
		blurRGB(width, height, inputPixelsCopy, features.kernalComplexion);
		var R, G, B, NR, NG, NB, sk;
		var length = inputPixels.length;
		var complexionValue = settings.ComplexionIntensity * 3;
		var temp=1./ 255;
		for (var i = 0; i < length; i = i + 4) {
			sk = maskPixels[i];
			if (sk > 0) {
				R = inputPixels[i];
				G = inputPixels[i + 1];
				B = inputPixels[i + 2];
				NR = complexionValue * (inputPixelsCopy[i] - R);
				if (NR < 0)
					NR = 0;
				NG = complexionValue * (inputPixelsCopy[i + 1] - G);
				if (NG < 0)
					NG = 0;
				NB = complexionValue * (inputPixelsCopy[i + 2] - B);
				if (NB < 0)
					NB = 0;
				NR += R;
				NG += G;
				NB += B;
				if (NR > 255)
					NR = 255;
				if (NG > 255)
					NG = 255;
				if (NB > 255)
					NB = 255;
				inputPixels[i] = (R *temp * (255 - sk)) + (NR *temp * sk);
				inputPixels[i + 1] = (G *temp * (255 - sk)) + (NG *temp * sk);
				inputPixels[i + 2] = (B *temp * (255 - sk)) + (NB *temp * sk);
			}
		}
		outputCtx.putImageData(inputImageData, x, y);
	};

	function getLipMask(width, height, vertices) {
		var maskCanvas = document.createElement("canvas");//document.getElementById("_mask");
		var maskCtx = maskCanvas.getContext("2d");
		maskCanvas2 = document.createElement("canvas");
		var maskCtx2 = maskCanvas2.getContext("2d");
		maskCanvas.width = width;
		maskCanvas.height = height;
		maskCanvas2.width = width;
		maskCanvas2.height = height;
		maskCtx.fillRect(0, 0, width, height);
		maskCtx2.fillRect(0, 0, width, height);

		//fill lip mask
		maskCtx.fillStyle = "white";
		maskCtx.beginPath();
		maskCtx.moveTo(vertices[48 * 2], vertices[48 * 2 + 1]);
		for (var i = 49; i <= 59; i++) {
			maskCtx.lineTo(vertices[i * 2], vertices[i * 2 + 1]);
		}
		maskCtx.lineTo(vertices[48 * 2], vertices[48 * 2 + 1]);
		maskCtx.fill();

		//remove innerlip
		maskCtx.fillStyle = "black";
		maskCtx.beginPath();
		maskCtx.moveTo(vertices[60 * 2], vertices[60 * 2 + 1]);
		for (var i = 61; i <= 67; i++) {
			maskCtx.lineTo(vertices[i * 2], vertices[i * 2 + 1]);
		}
		maskCtx.lineTo(vertices[60 * 2], vertices[60 * 2 + 1]);
		maskCtx.fill();

		//bottom lip mask
		maskCtx2.fillStyle = "white";
		maskCtx2.beginPath();
		maskCtx2.moveTo(vertices[48 * 2], vertices[48 * 2 + 1]);
		maskCtx2.lineTo(vertices[60 * 2], vertices[60 * 2 + 1]);
		for (var i = 67; i >= 64; i--) {
			maskCtx2.lineTo(vertices[i * 2], vertices[i * 2 + 1]);
		}
		maskCtx2.lineTo(vertices[54 * 2], vertices[54 * 2 + 1]);
		for (var i = 55; i <= 59; i++) {
			maskCtx2.lineTo(vertices[i * 2], (vertices[i * 2 + 1] + vertices[66 * 2 + 1]) *0.5);
		}
		maskCtx2.lineTo(vertices[48 * 2], vertices[48 * 2 + 1]);
		maskCtx2.fill();
		return maskCanvas;
	};

	features.applyLipstick = function (inputCanvas, outputCanvas, bounds, vertices) {
		var maskCanvas = getLipMask(inputCanvas.width, inputCanvas.height, vertices);
		var maskCtx = maskCanvas.getContext("2d");
		var maskCtx2 = maskCanvas2.getContext("2d");
		var inputCtx = inputCanvas.getContext("2d");
		var outputCtx = outputCanvas.getContext("2d");

		var x = bounds.x;
		var y = bounds.y;

		var inputImageData = inputCtx.getImageData(x, y, bounds.width, bounds.height);
		var inputPixels = inputImageData.data;
		var maskImageData = maskCtx.getImageData(x, y, bounds.width, bounds.height);
		var maskPixels = maskImageData.data;
		var maskImageDatabottomLip = maskCtx2.getImageData(x, y, bounds.width, bounds.height);
		var maskPixelsbottomLip = maskImageDatabottomLip.data;

		var width = inputImageData.width;
		var height = inputImageData.height;
		var ratio0, ratio1, ratio2, maxChannel;
		var color = settings.LipColor;
		if (color[0] == 0 && color[1] == 0 && color[2] == 0) {
			ratio0 = ratio1 = ratio2 = 0;//black color
			maxChannel = 0;//can be anything
		}
		else {
			if (color[0] >= color[1] && color[0] >= color[2]) {
				ratio0 = 1;
				ratio1 = color[1] / color[0];
				ratio2 = color[2] / color[0];
				maxChannel = 0;
			}
			else {
				if (color[1] >= color[2]) {
					ratio0 = color[0] / color[1];
					ratio1 = 1;
					ratio2 = color[2] / color[1];
					maxChannel = 1;
				}
				else {
					ratio0 = color[0] / color[2];
					ratio1 = color[1] / color[2];
					ratio2 = 1;
					maxChannel = 2;
				}
			}
		}
		blurGchannel(width, height, maskPixels, features.kernalLip);
		var inputPixelsCopy = inputPixels.slice();
		blurGchannel(width, height, inputPixelsCopy, features.kernalFace);
		//maskCtx.putImageData(maskImageData, 100, 0);
		var R, G, B, P, sk, shine;
		var length = inputPixels.length;
		var glossValue = settings.LipGlossValue * 4;
		var coverage = settings.LipIntensity;
		var factor = glossValue/(coverage * 255);//to reduce computation inside loop
		var temp=1./255;
		for (var i = 0; i < length; i = i + 4) {
			sk = maskPixels[i + 1] * coverage;
			if (sk > 0) {
				R = inputPixels[i];
				G = inputPixels[i + 1];
				B = inputPixels[i + 2];
				P = inputPixels[i + maxChannel];
				R = (R * temp * (255 - sk)) + (P * ratio0 * temp * sk);
				G = (G* temp * (255 - sk)) + (P * ratio1 * temp * sk);
				B = (B* temp * (255 - sk)) + (P * ratio2 * temp * sk);
				if (maskPixelsbottomLip[i] > 0) {
					shine = inputPixels[i + 1] - inputPixelsCopy[i + 1];
					if (shine < 0)
						shine = 0;
					P =  sk * factor * shine;
					R += P;
					G += P;
					B += P;
					if (R > 255)
						R = 255;
					if (G > 255)
						G = 255;
					if (B > 255)
						B = 255;
				}
				inputPixels[i] = R;
				inputPixels[i + 1] = G;
				inputPixels[i + 2] = B;
			}
		}
		outputCtx.putImageData(inputImageData, x, y);
	};

	function blurComplexionMask(width, height, maskPixels) {
		var maskPixelsCopy = maskPixels.slice();
		fullFaceMaskOptimizedKernalOperations(width, 0, height, features.kernalFace, maskPixels, maskPixelsCopy);
	}

	function blurFoundationMask(width, height, maskPixels) {
		//var startTime = new Date();
		var maskPixelsCopy = maskPixels.slice();
		var startY = parseInt(locations.eyebrow); var endY = height;
		fullFaceMaskOptimizedKernalOperations(width, startY, endY, features.kernalFace, maskPixels, maskPixelsCopy);
		startY = parseInt(locations.forehead); endY = parseInt(locations.eyebrow + features.kernalEyebrow - 1);
		fullFaceMaskOptimizedKernalOperations(width, startY, endY, features.kernalEyebrow, maskPixels, maskPixelsCopy);
		startY = 0; endY = parseInt(locations.forehead + features.kernalForehead - 1);
		fullFaceMaskOptimizedKernalOperations(width, startY, endY, features.kernalForehead, maskPixels, maskPixelsCopy);
		// var endTime = new Date();
		// var span = (endTime - startTime);
		// console.log("Time taken to blurFoundationMask : " + span);
	};

	function fullFaceMaskOptimizedKernalOperations(width, startY, endY, kernalSize, maskPixels, maskPixelsCopy) {
		var iLimit = endY - kernalSize + 1;
		var jLimit = width - kernalSize + 1;
		var anchor = parseInt(kernalSize *0.5), sum;
		var det=1./kernalSize;
		//if conditions are written to optimize logic based on the fact that mask edges only needed to be smoothed.
		for (var i = startY; i < endY; i++) {
			var temp = i * width;
			for (var j = 0; j < jLimit; j++) {
				sum = 0;
				if (maskPixels[(temp + j) * 4] == maskPixels[(temp + (j + anchor)) * 4] && maskPixels[(temp + (j + anchor)) * 4] == maskPixels[(temp + (j + kernalSize - 1)) * 4]) {
					//no need to update here.
				}
				else {
					for (var s = j + kernalSize - 1; s >= j; s--) {
						sum += maskPixels[(temp + s) * 4];
					}
					sum *= det;
					maskPixelsCopy[(temp + (j + anchor)) * 4] = sum;//only r channel is enough to update
				}
			}
		}
		for (var j = 0; j < width; j++) {
			var temp = j * 4;
			var temp2 = width * 4;
			for (var i = startY; i < iLimit; i++) {
				sum = 0;
				if (maskPixelsCopy[i * temp2 + temp] == maskPixelsCopy[(i + anchor) * temp2 + temp] && maskPixelsCopy[(i + anchor) * temp2 + temp] == maskPixelsCopy[(i + kernalSize - 1) * temp2 + temp]) {
					maskPixels[(i + anchor) * temp2 + temp] = maskPixelsCopy[i * temp2 + temp];
					// maskPixels[(i + anchor) * temp2 + temp + 1] =  maskPixelsCopy[i * temp2 + temp];
					// maskPixels[(i + anchor) * temp2 + temp + 2] =  maskPixelsCopy[i * temp2 + temp];
				}
				else {
					for (var q = i + kernalSize - 1; q >= i; q--) {
						sum += maskPixelsCopy[q * temp2 + temp];
					}
					sum *= det;
					maskPixels[(i + anchor) * temp2 + temp] = sum;//only r channel is enough to update
					// maskPixels[(i + anchor) * temp2 + temp + 1] = sum;
					// maskPixels[(i + anchor) * temp2 + temp + 2] = sum;
				}
			}
		}
	};

	function blurGchannel(width, height, pixels, kernalSize) {
		//var startTime = new Date();
		var anchor = parseInt(kernalSize *0.5), sum;
		var det=1./kernalSize;
		var pixelsCopy = pixels.slice();
		var jLimit = width - kernalSize + 1;
		for (var i = 0; i < height; i++) {
			var temp = i * width;
			for (var j = 0; j < jLimit; j++) {
				sum = 0;
				for (var s = j + kernalSize - 1; s >= j; s--) {
					sum += pixels[(temp + s) * 4 + 1];
				}
				sum *= det;
				pixelsCopy[(temp + (j + anchor)) * 4 + 1] = sum;
			}
		}
		var iLimit = height - kernalSize + 1;
		for (var j = 0; j < width; j++) {
			var temp = j * 4;
			var temp2 = width * 4;
			for (var i = 0; i < iLimit; i++) {
				sum = 0;
				for (var q = i + kernalSize - 1; q >= i; q--) {
					sum += pixelsCopy[q * temp2 + temp + 1];
				}
				sum *= det;
				pixels[(i + anchor) * temp2 + temp + 1] = sum;
				// pixels[(i + anchor) * temp2 + temp] = sum;
				// pixels[(i + anchor) * temp2 + temp + 2] = sum;
			}
		}
		// var endTime = new Date();
		// var span = (endTime - startTime);
		// console.log("Time taken to blurGchannel: " + span);
	};

	function blurRGB(width, height, pixels, kernalSize) {
		//var startTime = new Date();
		var anchor = parseInt(kernalSize *0.5);
		var det=1./kernalSize;
		var sumR, sumG, sumB;
		var pixelsCopy = pixels.slice();
		var jLimit = width - kernalSize + 1;
		for (var i = 0; i < height; i++) {
			var temp = i * width;
			for (var j = 0; j < jLimit; j++) {
				sumR = 0; sumG = 0; sumB = 0;
				for (var s = j + kernalSize - 1; s >= j; s--) {
					sumR += pixels[(temp + s) * 4];
					sumG += pixels[(temp + s) * 4 + 1];
					sumB += pixels[(temp + s) * 4 + 2];
				}
				sumR *= det;
				sumG *= det;
				sumB *= det;
				pixelsCopy[(temp + (j + anchor)) * 4] = sumR;
				pixelsCopy[(temp + (j + anchor)) * 4 + 1] = sumG;
				pixelsCopy[(temp + (j + anchor)) * 4 + 2] = sumB;
			}
		}
		var iLimit = height - kernalSize + 1;
		for (var j = 0; j < width; j++) {
			var temp = j * 4;
			var temp2 = width * 4;
			for (var i = 0; i < iLimit; i++) {
				sumR = 0; sumG = 0; sumB = 0;
				for (var q = i + kernalSize - 1; q >= i; q--) {
					sumR += pixelsCopy[q * temp2 + temp];
					sumG += pixelsCopy[q * temp2 + temp + 1];
					sumB += pixelsCopy[q * temp2 + temp + 2];
				}
				sumR *= det;
				sumG *= det;
				sumB *= det;
				pixels[(i + anchor) * temp2 + temp] = sumR;
				pixels[(i + anchor) * temp2 + temp + 1] = sumG;
				pixels[(i + anchor) * temp2 + temp + 2] = sumB;
			}
		}
		// var endTime = new Date();
		// var span = (endTime - startTime);
		// console.log("Time taken to blurRGB: " + span);
	};
})();
