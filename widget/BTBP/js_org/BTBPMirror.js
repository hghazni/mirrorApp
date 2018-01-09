//
// Namespace: btbpExample structures these examples.
//

var btbpExample = {
	appId: "TestAppForDemo", // Choose your own app id. 8 chars minimum.

	loader: { queuePreloader: null },	// preloading/example loading
	imageData: {						// image data source handling
		webcam: { stream: null },		// either webcam ...
		picture: {}						// ... or pictures/images
	},
	dom: {},							// html dom stuff
	gui: {},							// QuickSettings elements
	drawing: {},						// drawing the results using createJS
	features :{},					// btbp features
	drawing3d: {						// all 3D engine functions
		t3d: {}//,						// ThreeJS stuff
		//f3d: {}						// Flare3D stuff (coming later)
	},
	stats: {}						// fps meter,
};

(function() {
	// Define our constructor
	var mirrorOptions = this.options;
	this.BTBPMirror = function()
	{
		 // Define option defaults
		 var defaults = {
			content: "",
			key: "",
			mirror_config:{
				BeautyFeatureList:[],
				SkinFeatureList:[],
				DeepTagList:[],
				auto_reset:false,
				show_settings:false,
				beautyFace:true,
				auto_reset_time_interval: 1000 * 60 * 3
			}
		}

		// Create options by extending defaults with the passed in arugments
		if (arguments[0] && typeof arguments[0] === "object") {
		this.options = extendDefaults(defaults, arguments[0]);
		}
		else{
			this.options = defaults;
		}
	
	};

	BTBPMirror.prototype.startMirror = function()
	{
		mirrorOptions = this.options;
		if (mirrorOptions.key == undefined || mirrorOptions.key.length == 0) {
		 alert("Key is mandatory");
		 return;
		}

		var url = "\x68\x74\x74\x70\x73\x3A\x2F\x2F\x61\x70\x69\x2E\x62\x74\x62\x70\x2E\x6F\x72\x67\x2F\x64\x65\x65\x70\x74\x61\x67\x2F\x41\x70\x70\x73\x65\x72\x76\x69\x63\x65\x2E\x73\x76\x63\x2F";

		var licenseURL = url + "licensestatus/" + mirrorOptions.key;
		$.ajax({
			type: "GET",
			url: licenseURL,
			success: function(response) {
				//console.log(response);
				var jsonData = response;//JSON.parse(response);
				if(jsonData.Status)
				{
					initMirror();
				}
				else{
					console.log("IFace Authentication failed, "+jsonData.Message);
				}
			}, 
			error : function()
			{
				console.log("IFace Authentication service call failed!");
				initMirror();
			}
		});

	};

	BTBPMirror.prototype.stopMirror = function()
	{
		btbpExample.imageData.webcam.stopStream();
		var container = $("#"+mirrorOptions.content);
		container.html("");
	};

	BTBPMirror.prototype.stopCamera = function()
	{
		btbpExample.imageData.webcam.stopStream();
	};

	BTBPMirror.prototype.startCamera = function()
	{
		btbpExample.imageData.webcam.startStream();
	};

	function initMirror()
	{
		var container = $("#"+mirrorOptions.content);
		container.html(mirrorContent);
		btbpExample.mirrorOptions = mirrorOptions;
		btbpExample.appConfig = mirrorOptions.mirror_config;
		btbpExample.start();
		onStartClicked();
	}

	// Utility method to extend defaults with user options
	function extendDefaults(source, properties) {
		var property;
		for (property in properties) {
		if (properties.hasOwnProperty(property)) {
			source[property] = properties[property];
		}
		}
		return source;
	}

}());

//
// Namespace: btbpv4 is the (mandatory) namespace for the BTBP library.
//

var hostUrl = "BTBP/";

var btbpv4BaseURL = hostUrl+"js/libs/btbp_wasm/";
// detect WebAssembly support and load either WASM or ASM version of BRFv4
var support	= (typeof WebAssembly === 'object');

if (!support) { btbpv4BaseURL = hostUrl+"js/libs/btbp_asmjs/"; }

//console.log("Checking support of WebAssembly: " + support + " " + (support ? "loading WASM (not ASM)." : "loading ASM (not WASM)."));

var btbpv4 = {locateFile: function(fileName) { return btbpv4BaseURL+fileName; }};


//
// Demo entry point: preloading js files.
//


btbpExample.start = function() {

	btbpExample.loader.preload([
		hostUrl+"js/upload.js",
		hostUrl+"js/common.js",
		hostUrl+"js/vendor/dat.gui.min.js",
		//"js/utils/BTBPGUIUtils.js",
		btbpv4BaseURL + "BRFv4_JS_BT011117_v4.0.1_commercial.js",
		//"js/libs/btbp/BTBP_JS_trial.js",						// BTBP SDK

		hostUrl+"js/libs/highlight/highlight.pack.js",

		hostUrl+"js/libs/createjs/easeljs-0.8.2.min.js",				// canvas drawing lib
		
		hostUrl+"js/utils/BTBPDOMUtils.js",							// DOM handling
		//"js/utils/BTBPStats.js",								// FPS meter
		
		hostUrl+"js/utils/BTBPSetupSettings.js",						//BTBP settings
		hostUrl+"js/utils/BTBPDrawingUtils_CreateJS.js",				// BTBP result drawing
		hostUrl+"js/utils/BTBPSetupWebcam.js",							// webcam handling
		//"js/utils/BTBPSetupPicture.js",						// picture/image handling
		hostUrl+"js/utils/BTBPSetupExample.js",						// overall example setup

		hostUrl+"js/utils/BTBPPointUtils.js",							// some calculation helpers
		hostUrl+"js/utils/BTBPExtendedFace.js",                         // extended face

		hostUrl+"js/face_libs/BTBPFeatures.js",						    // BTBP makeup features implementation		
		hostUrl+"js/face_libs/btbp_engine.js"	                        // main file
	
	], function() {

		btbpExample.init("webcam");

	});
};

//
// Helper stuff: logging and loading
//

// Custom way to write to a log/error to console.

btbpExample.trace = function(msg, error) {
	if(typeof window !== 'undefined' && window.console) {
		/*
		var now = (window.performance.now() / 1000).toFixed(3);
		 if(error) {	window.console.log(now + ': ', msg); }
		 else { window.console.log(now + ': ', msg); }
		 */
	}
};

// loading of javascript files:
//
// preload(filesToLoad, callback) // filesToLoad (array)
// loadExample(filesToLoad, callback) // filesToLoad (array)
// setProgressBar(percent, visible)

(function () {
	"use strict";
    
	var loader = btbpExample.loader;

	loader.preload = function (filesToLoad, callback) {

		if (loader.queuePreloader !== null || !filesToLoad) {
			return;
		}

		function onPreloadProgress(event) {
			loader.setProgressBar(event.loaded, true);
		}

		function onPreloadComplete(event) {
			loader.setProgressBar(1.0, false);
			if(callback) callback();
		}

		var queue = loader.queuePreloader = new createjs.LoadQueue(true);
		queue.on("progress", onPreloadProgress);
		queue.on("complete", onPreloadComplete);
		queue.loadManifest(filesToLoad, true);
	};

	loader.loadExample = function (filesToLoad, callback) {

		function onProgress(event) {
			loader.setProgressBar(event.loaded, true);
		}

		function onComplete(event) {
			loader.setProgressBar(1.0, false);
			if(callback) callback();
		}

		var queue = loader.queueExamples = new createjs.LoadQueue(true);
		queue.on("progress", onProgress);
		queue.on("complete", onComplete);
		queue.loadManifest(filesToLoad, true);
	};

	loader.setProgressBar = function(percent, visible) {
         
		var bar = document.getElementById("_progressBar");
		if(!bar) return;

		if(percent < 0.0) percent = 0.0;
		if(percent > 1.0) percent = 1.0;

		var width = Math.round(percent * 640);
		var color = "#ccc";

		bar.style.width = width + "px";
		bar.style.backgroundColor = "#" + color.toString(16);
		bar.style.display = visible ? "block" : "none";
	};
})();


//BTBPGUIUtils

var loaderInterval;
function onStartClicked() {
	//var launch_screen = document.getElementById("launch_screen");
	btbpExample.config.isStarted = true;
	$("#loader_deeptag_container").hide();
	//$("#deeptag_rejection_txt").show();
	$("#deeptag_status_txt").text("Please place your face with in the red box");
	clearInterval(loaderInterval);
	if (btbpExample.config.isReady) {
		//launch_screen.style.display = "none";
		//btbpExample.callbacks.showDataGUI();
		
		$(".ac").css({"display":"block"});
		$("#launch_screen").fadeOut();

		getLocation();
	}
	else {
		$("#loader_launch_screen").show();
		loaderInterval = setInterval(function () {
			onStartClicked();
		}, 1000);
	}
}

function onRetryClicked() {
	$("#loader_launch_screen").show();
	$("#error_container").hide();

	btbpExample.init("webcam");
}

function onRestartClicked() {
	onReanalyze();
	btbpExample.settings.reset();
	clearClimateDetails();
	btbpExample.config.isFoundationClicked = false;
}


function onLipstickShades ()
{
	/*
	$("#foundationshades_container").hide();
	$("#lipsShades_container").css({"display":"table"});
	*/
	
	$("#foundationshades_container").fadeOut();
	$("#lipsShades_container").fadeIn();
	$("#lbl_lipShades").css({"color":"#6eb6ff"});
	$("#lbl_foundationShades").css({"color":"white"});
	
}


function onFoundationShades ()
{
	if(!btbpExample.config.isFoundationClicked)
	{
		btbpExample.settings.isFoundationClicked = true;
		btbpExample.settings.Foundation = true;
	}

	/*
	$("#lipsShades_container").css({"display":"none"});
	$("#foundationshades_container").show();
	*/

	$("#lipsShades_container").fadeOut();
	$("#foundationshades_container").fadeIn();
	

	$("#lbl_lipShades").css({"color":"white"});
	$("#lbl_foundationShades").css({"color":"#6eb6ff"});
}

function onSettingsClicked()
{
	btbpExample.callbacks.toggleDataGUI();
}

(function () {
	"use strict";

	var example = btbpExample;
	
	example.config = {
		isStarted: false,
		isReady : false,
		isFoundationClicked: false,
		isAutoRest: true,
		resetTimeout: 60  /*in seconds*/
	};

})();

$(window).resize(function(){
	try{
		var frame = document.getElementById("app_container");
		
			var frameWidth = frame.clientWidth;
			var frameHeight = frame.clientHeight;
		
			document.getElementById("_foundationshades").style.width = frameWidth*0.8+"px";
	}
	catch(e)
	{
		console.log("Exception : "+e);
	}
	
	try{
		setupAppLayout();
	}
	catch(e)
	{

	}
});



//mirror html content
var mirrorContent="";
mirrorContent += "";
mirrorContent += "<div class=\"app_container align_center_horizontal\" id=\"app_container\">";
mirrorContent += "		<div class=\"screens\">";
mirrorContent += "			<div id=\"launch_screen\" style=\"display:block;\">";
mirrorContent += "				<div class=\"content\">";
mirrorContent += "					";
mirrorContent += "					<br\/>";
mirrorContent += "					";
mirrorContent += "					<br\/>";
mirrorContent += "					<br\/>";
mirrorContent += "					<br\/>";
mirrorContent += "					<br\/>";
mirrorContent += "					<div id=\"error_container\" style=\"display:none;\">";
mirrorContent += "						<span id=\"error_message\"><\/span>";
mirrorContent += "						<br\/>";
mirrorContent += "						<br\/>";
mirrorContent += "						<a class=\"btn\" href=\"javascript:onRetryClicked();\">RETRY<\/a>";
mirrorContent += "					<\/div>";
mirrorContent += "";
mirrorContent += "				<\/div>";
mirrorContent += "				";
mirrorContent += "				<div id=\"loader_launch_screen\" style=\"display:none;\">";
mirrorContent += "					<div class=\"loader_container align_center\">";
mirrorContent += "						<img src=\"BTBP\/img\/Spinner.gif\" width=\"80\" height=\"80\" \/>";
mirrorContent += "						<br\/>";
mirrorContent += "						<span>Loading<\/span>";
mirrorContent += "					<\/div>";
mirrorContent += "";
mirrorContent += "";
mirrorContent += "				<\/div>";
mirrorContent += "";
mirrorContent += "			<\/div>";
mirrorContent += "";
mirrorContent += "			<div id=\"ui_controlls\" class=\"ui_controlls\" style=\"display:none;\">";
mirrorContent += "				";
mirrorContent += "				<div id=\"controls_menu\">";
mirrorContent += "					<div style=\"position: relative;width:100%;height:100%;\">";
mirrorContent += "							<div class=\"controls_selection\">";
mirrorContent += "									<div>";
mirrorContent += "										<a href=\"javascript:onLipstickShades()\" id=\"lbl_lipShades\" style=\"color:#6eb6ff;\">Lipstick<\/a>";
mirrorContent += "									<\/div>";
mirrorContent += "";
mirrorContent += "									<div>";
mirrorContent += "										<a href=\"javascript:onFoundationShades()\"  id=\"lbl_foundationShades\">Foundation<\/a>";
mirrorContent += "									<\/div>";
mirrorContent += "							<\/div>";
mirrorContent += "";
mirrorContent += "						<div class=\"controls_container\">";
mirrorContent += "							<div id=\"lipsShades_container\" class=\"color_shades\" style=\"display:table;width:100%;height:100%;\">";
mirrorContent += "								<ul id=\"_lipshades\" class=\"center_vertical\">";
mirrorContent += "";
mirrorContent += "								<\/ul>";
mirrorContent += "							<\/div>";
mirrorContent += "							<div id=\"foundationshades_container\" class=\"color_shades\" style=\"display:none;\">";
mirrorContent += "								<div style=\"display:table;width:100%;height:100%;\">";
mirrorContent += "									<div style=\"display:table-cell;vertical-align:middle;\">";
mirrorContent += "								<ul id=\"_foundationshades\">";
mirrorContent += "";
mirrorContent += "								<\/ul>";
mirrorContent += "							<\/div>";
mirrorContent += "								<\/div>";
mirrorContent += "							<\/div>";
mirrorContent += "";
mirrorContent += "						<\/div>";
mirrorContent += "					<\/div>";
mirrorContent += "				<\/div>";
mirrorContent += "";
mirrorContent += "				<div class=\"results_left_panel_container\">";
mirrorContent += "					<div class=\"\">";
mirrorContent += "						<div class=\"concerns_list\" id=\"concerns_list\">";
mirrorContent += "";
mirrorContent += "						<\/div>";
mirrorContent += "					<\/div>";
mirrorContent += "				<\/div>";
mirrorContent += "";
mirrorContent += "				<div class=\"results_bottom_panel_container\">";
mirrorContent += "					";
mirrorContent += "					<div id=\"loader_deeptag_container\">";
mirrorContent += "						<img id=\"deeptag_status_loader\" src=\"BTBP\/img\/Spinner_black.gif\" width=\"40\" height=\"40\" \/>";
mirrorContent += "						<span id=\"deeptag_status_txt\">Analzing...<\/span>";
mirrorContent += "					<\/div>";
mirrorContent += "					<div class=\"image_rejection_cotainer\">";
mirrorContent += "						<span id=\"deeptag_rejection_txt\">Please align your face within the red box<\/span>";
mirrorContent += "					<\/div>";
mirrorContent += "					";
mirrorContent += "					<div id=\"tag_item_list_parent\">";
mirrorContent += "						<div class=\"tag_item_list\">";
mirrorContent += "";
mirrorContent += "							<div class=\"tag_item\" id=\"gender_item\">";
mirrorContent += "								<div class=\"tag_value\" id=\"txt_gender\"><\/div>";
mirrorContent += "								<div class=\"tag_image_container\">";
mirrorContent += "									<img id=\"Male_Female_img\" src=\"BTBP\/img\/Gender_Disabled_Icon.png\" \/>";
mirrorContent += "								<\/div>";
mirrorContent += "								<div class=\"tag_name\">Gender<\/div>";
mirrorContent += "							<\/div>";
mirrorContent += "";
mirrorContent += "							<div class=\"tag_item\" id=\"age_item\">";
mirrorContent += "								<div class=\"tag_value\"><\/div>";
mirrorContent += "								<div class=\"tag_image_container\">";
mirrorContent += "									<img src=\"BTBP\/img\/Age_Icon.png\" \/>";
mirrorContent += "									<span id=\"age_index\" class=\"align_center\"><\/span>";
mirrorContent += "								<\/div>";
mirrorContent += "								<div class=\"tag_name\">Age<\/div>";
mirrorContent += "							<\/div>";
mirrorContent += "";
mirrorContent += "							<div class=\"tag_item\" id=\"skin_type_item\">";
mirrorContent += "								<div class=\"tag_value\"><\/div>";
mirrorContent += "								<div class=\"tag_image_container\" style=\"height:50%;\">";
mirrorContent += "									<img id=\"skin_type_img\" class=\"align_center\"  src=\"BTBP\/img\/skintype\/SkinType_GreyShade.png\" style=\"height:100%;\" \/>";
mirrorContent += "									<img id=\"skin_type_selected_img\" class=\"align_center\" src=\"BTBP\/img\/skintype\/SkinType_PantoneShade.png\" style=\"height:100%;display:none;\" \/>";
mirrorContent += "								";
mirrorContent += "									<span id=\"skin_type_index\" class=\"align_center\"><\/span>";
mirrorContent += "								<\/div>";
mirrorContent += "								<div class=\"tag_name\">Skin Type<\/div>";
mirrorContent += "							<\/div> ";
mirrorContent += "";
mirrorContent += "							<div class=\"tag_item\" id=\"pollution_item\">";
mirrorContent += "								<div class=\"tag_value\" id=\"txt_pollution_value\"><\/div>";
mirrorContent += "								<div class=\"tag_image_container\">";
mirrorContent += "									<img src=\"BTBP\/img\/Air_Quality Icon.png\" \/>";
mirrorContent += "									<span id=\"pollution_index\" class=\"align_center\"><\/span>";
mirrorContent += "								<\/div>";
mirrorContent += "								<div class=\"tag_name\">Air Quality<\/div>";
mirrorContent += "							<\/div>";
mirrorContent += "";
mirrorContent += "							<div class=\"tag_item\" id=\"location_item\">";
mirrorContent += "								<div class=\"tag_value\" id=\"txt_location_value\"><\/div>";
mirrorContent += "								<div class=\"tag_image_container\">";
mirrorContent += "									<img src=\"BTBP\/img\/Location_Icon.png\" \/>";
mirrorContent += "								<\/div>";
mirrorContent += "								<div class=\"tag_name\">Location<\/div>";
mirrorContent += "							<\/div>";
mirrorContent += "";
mirrorContent += "							<div class=\"tag_item\" id=\"uv_item\">";
mirrorContent += "								<div class=\"tag_value\" id=\"txt_uv_value\">";
mirrorContent += "";
mirrorContent += "								<\/div>";
mirrorContent += "								<div class=\"tag_image_container\">";
mirrorContent += "									<img src=\"BTBP\/img\/UV_index_icon.png\" \/>";
mirrorContent += "									<span id=\"uv_index\" class=\"align_center\"><\/span>";
mirrorContent += "								<\/div>";
mirrorContent += "								<div class=\"tag_name\">UV Index<\/div>";
mirrorContent += "							<\/div>";
mirrorContent += "						<\/div>";
mirrorContent += "					<\/div>";
mirrorContent += "				<\/div>";
mirrorContent += "";
mirrorContent += "				<div id=\"data-gui-container\">";
mirrorContent += "";
mirrorContent += "					";
mirrorContent += "				<\/div>";
mirrorContent += "				";
mirrorContent += "";
mirrorContent += "				<img id=\"restart_btn\" src=\"BTBP\/img\/Reset icon.png\" width=\"40\" style=\"position:absolute;left:10px;bottom:13%;cursor:pointer;z-index:100;\" onclick=\"onRestartClicked()\"\/>";
mirrorContent += "";
mirrorContent += "				<img id=\"settings_btn\" src=\"BTBP\/img\/Settings Icon.png\" width=\"40\" style=\"position:absolute;right:10px;bottom:13%;cursor:pointer;z-index:100;\" onclick=\"onSettingsClicked()\"\/>";
mirrorContent += "";
mirrorContent += "";
mirrorContent += "			<\/div>";
mirrorContent += "";
mirrorContent += "			<div id=\"_wrapper\">";
mirrorContent += "";
mirrorContent += "				<div id=\"_content\">";
mirrorContent += "					<video id=\"_webcam\" autoplay muted playsInline><\/video>";
mirrorContent += "					<canvas id=\"_imageData\"><\/canvas>";
mirrorContent += "";
mirrorContent += "					<canvas id=\"_faceSub\"><\/canvas>";
mirrorContent += "					<canvas id=\"_mask\"><\/canvas>";
mirrorContent += "					<canvas id=\"_t3d\"><\/canvas>";
mirrorContent += "					<canvas id=\"_f3d\"><\/canvas>";
mirrorContent += "					<canvas id=\"_drawing\"><\/canvas>";
mirrorContent += "";
mirrorContent += "";
mirrorContent += "";
mirrorContent += "					<div id=\"_stats\"><\/div>";
mirrorContent += "					<div id=\"_progressBar\"><\/div>";
mirrorContent += "				<\/div>";
mirrorContent += "";
mirrorContent += "";
mirrorContent += "				<div id=\"_subline\"><\/div>";
mirrorContent += "				<div id=\"_highlight\" style=\"display:none\">";
mirrorContent += "					<pre><code class=\"javascript\" id=\"_gist\"><\/code><\/pre>";
mirrorContent += "				<\/div>";
mirrorContent += "				<a id=\"_saveImage\" download=\"Original_Image\"><\/a>";
mirrorContent += "			<\/div>";
mirrorContent += "		<\/div>";
mirrorContent += "	<\/div>";
