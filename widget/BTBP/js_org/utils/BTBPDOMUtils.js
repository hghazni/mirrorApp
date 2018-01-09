// Some helpers to handle the HTML DOM:
//
// updateLayout(width, height)
// updateHeadline(text)
// updateCodeSnippet(text)
//
// getElement(elementId)
// updateElementSize(element, width, height, whatToUpdate)
// addElement(element, parent)
//
// createElement(htmlTag, id, width, height, parent)
// createDiv(id, parent);
// createCanvas(id, width, height, parent)
// createVideo(id, width, height, parent)

(function () {
	"use strict";

	var dom			= btbpExample.dom;

	dom.stageWidth	= 640;
	dom.stageHeight	= 480;

	dom.updateLayout = function(width, height) {
	
		// update resolution, video size, canvas sizes etc.

		dom.stageWidth	= width;
		dom.stageHeight	= height;
	
		var getElement			= dom.getElement;
		var updateElementSize	= dom.updateElementSize;
	
		//updateElementSize(getElement("_content"), 		width, height, 0);
		updateElementSize(getElement("_drawing"), 		width, height, 1);
		updateElementSize(getElement("_faceSub"), 		width, height, 1);
		updateElementSize(getElement("_t3d"), 			width, height, 1);
		updateElementSize(getElement("_f3d"), 			width, height, 1);
		updateElementSize(getElement("_webcam"),		width, height, 1);
		updateElementSize(getElement("_imageData"),		width, height, 1);

		var subline = getElement("_subline");
		//if(subline) subline.style.top = (height + 10) + "px";
	
		var highlight = getElement("_highlight");
		if(highlight) highlight.style.top = (height + 45) + "px";

		
		setupAppLayout();

		btbpExample.config.isReady = true;
		document.getElementById("ui_controlls").style.display="block";
		$("#loader_launch_screen").hide();
		$("#launch_screen").hide();
		
	};

	
	dom.updateHeadline = function(text) {
	
		var subline = dom.getElement("_subline");
		if(subline) {
			while(text.indexOf("\n") >= 0) {
				text = text.replace("\n", "<br>");
			}
			subline.innerHTML = "<b>" + text + "</b>";
		}
	};
	
	dom.updateCodeSnippet = function(text) {
	
		var gist = dom.getElement("_gist");
		if(gist && hljs) {

			var lines = text.split("\n");

			var i = 0;
			var l = lines.length;

			for(; i < l; i++) {

				var line = lines[i];

				while(line.indexOf("	") >= 0) {

					var k = line.indexOf("	");
					var repStr = "";

					k = 4 - (k % 4);

					while(k-- > 0) {
						repStr += " ";
					}

					line = line.replace("	", repStr);
				}

				lines[i] = line;
			}

			text = lines.join("\n");

			gist.innerHTML = text;
			hljs.highlightBlock(gist);
		}
	};
	
	dom.getElement = function(elementId) {
	
		var element = dom[elementId];
		if(!element) {
	
			element = document.getElementById(elementId);
			if(element) {
				dom[elementId] = element;
			}
		}
	
		return element;
	};
	
	dom.updateElementSize = function(element, width, height, whatToUpdate) {
	
		if(element) {
	
			if(whatToUpdate === 0) { // div
				element.style.width		= width  + "px";
				element.style.height	= height + "px";
			} else if(whatToUpdate === 1) { // canvas, video
				element.width			= width;
				element.height			= height;
			} else if(whatToUpdate === 2) { // utility class instance
				element.updateLayout(width, height);
			}
		}
	};

	dom.addElement = function(element, parent) {

		if(element) {

			var addToDom = true;

			if(parent) {

				var p = document.getElementById(parent);
				if(p) {
					p.appendChild(element);
					addToDom = false;
				}
			}

			if(addToDom) {
				document.body.appendChild(element);
			}
		}
	};

	dom.createElement = function(htmlTag, id, width, height, parent) {

		var tag = null;

		if(htmlTag === "canvas" || htmlTag === "video" || htmlTag === "div") {
	
			tag = document.createElement(htmlTag);
			tag.id = id;

			if(width !== 0 && height !== 0) {
				dom.updateElementSize(tag, width, height, (htmlTag !== "div") ? 1 : 0);
			}

			dom.addElement(tag, parent);
		}

		return tag;
	};

	dom.createDiv = function(id, parent) {

		var tag = document.getElementById(id);

		if(!tag) {	// Not found? Create it.
			tag = dom.createElement("div", id, 0, 0, parent);
		}

		return tag;
	};
	
	dom.createCanvas = function(id, width, height, parent) {

		var tag = document.getElementById(id);

		if(!tag) {	// Not found? Create it.
			tag = dom.createElement("canvas", id, width, height, parent);
		} else { 	// Found? Then update size.
			dom.updateElementSize(tag, width, height, 1);
		}

		return tag;
	};
	
	dom.createVideo = function(id, width, height, parent) {

		var tag = document.getElementById(id);

		if(!tag) {	// Not found? Create it.
			tag = dom.createElement("video", id, width, height, parent);
		}

		return tag;
	};
})();

function setupAppLayout()
{
	var width = document.getElementById("_webcam").width;
	var height = document.getElementById("_webcam").height;
	if(width == 0 || height == 0)
	{
		return;
	}
	
	var content = document.getElementById("_content");
	var frame = document.getElementById("app_container");

	var windowWidth = window.innerWidth;
	var windowHeight = window.innerHeight;

	windowHeight = Math.min(720, windowHeight);
	windowHeight = Math.max(480, windowHeight);
	var mirrorHeight = windowHeight;
	var mirrorWidth = windowHeight*0.8;
	if(mirrorWidth > windowWidth)
	{
		mirrorHeight = windowWidth * 1.4;
		mirrorWidth = windowWidth;
	}
	frame.style.height = mirrorHeight+"px";
	frame.style.width = mirrorWidth +"px";
	
	//console.log("windowHeight :"+windowHeight + " windowHeight : "+ windowHeight*0.8);

	var frameWidth = frame.clientWidth;
	var frameHeight = frame.clientHeight;

	//console.log(frame)
	
	var scaledWidth = (width/height) * frameHeight;
	var scaledHeight = (height/width) * frameWidth;

	if(scaledHeight > frameHeight)
	{
		content.style.width = "100%";
		content.style.height = "auto";

		var scaledHeight = (height/width) * frameWidth;
		var translateHeight = (scaledHeight - frameHeight)/2;
	
		content.style.transform = "translate(0px, "+-translateHeight+"px)";
		$("#_wrapper canvas").css( { "width": "100%", "height": "auto" });
	}
	else{
		content.style.width = "auto";
		content.style.height = "100%";

		var scaledWidth = (width/height) * frameHeight;
		var translateWidth = (scaledWidth - frameWidth)/2;

		content.style.transform = "translate("+-translateWidth+"px)";
		$("#_wrapper canvas").css( { "width": "auto", "height": "100%" });
	}

	document.getElementById("_foundationshades").style.width = frameWidth*0.8+"px";
	document.getElementById("concerns_list").style.maxHeight = (frameHeight * 0.6) + "px";
	
}