// BTBP example setup and handling:
//
// Init everything:
// + image data (either webcam or picture)
// + BTBP SDK with the size of the image data
// + Set all the parameters for BTBP according to the chosen example
// + Reinit if image data size changes

var cameraErrorCode = {
	CAMERA_NOT_FOUND: 101,
	GET_USER_MEDIA_NOT_SUPPORTED: 102,
	SECURE_CONNECTION_ERROR: 103,
	PERMISSION_DINED: 104,
	CAMERA_BUSY: 105,
	UNKNOWN_ERROR:106
};
(function () {
	"use strict";

	var example = btbpExample;

	var imageData = example.imageData;
	var dom = example.dom;
	var stats = example.stats;
	var drawing = example.drawing;
	var t3d = example.drawing3d.t3d;
	var trace = example.trace;

	var btbpManager = null;
	var resolution = null;

	var paused = true;

	//Lipstick shades
	var LipstickShades = [
		{ color: [255, 255, 255] },
		{ color: [142, 0, 0] },
		{ color: [142, 0, 71] },
		{ color: [142, 0, 142] },
		{ color: [236, 118, 118] }
	];

	var foudataionShades = [
		[255, 255, 255],
		[238, 215, 200],
		[230, 202, 181],
		[223, 189, 164],
		[216, 174, 149],
		[213, 168, 132],
		[206, 152, 122],
		[198, 140, 113],
		[184, 133, 105],
		[178, 117, 95],
		[165, 110, 86],
		[145, 108, 83],
		[132, 95, 67],
		[120, 85, 57],
		[107, 80, 68],
		[94, 68, 45],
		[84, 47, 31]


	];


	var isDataGUI = true;
	example.callbacks = {
		onCameraError: function (errorCode) {
			var msg = getMessage(errorCode);
			if(msg == undefined || msg.length == 0)
			{
				msg = "Camera is not available or busy";
			}
			$("#loader_launch_screen").hide();
			$("#error_message").html(msg);
			$("#error_container").show();
			clearInterval(loaderInterval);

		},
		showDataGUI: function () {
			gui.closed = false;
		},
		toggleDataGUI: function () {

			if (isDataGUI) {
				//customDataGUIContainer.style.display="block";
				$("#data-gui-container").animate({ "right": "0px" }, "slow");
				isDataGUI = false;

			}
			else {
				//customDataGUIContainer.style.display="none";
				$("#data-gui-container").animate({ "right": "-320px" }, "slow");
				isDataGUI = true;
			}

			//dat.GUI.toggleHide();
		},
		resetApp: function () {
			//console.log("App reseted");
			onRestartClicked();
		}

	};

	var DefaultSettings = function () {

		this.FLDPoints = false;
		this.FLDTriangles = false;
		this.Lipstick = false;
		this.LipIntensity = 0.33;
		this.LipGlossValue = 0.5;
		this.Foundation = false;
		this.FoundationIntensity = 0.3;
		this.Complexion = true;
		this.ComplexionIntensity = 0.5;
		this.LipColor = [142, 0, 0];
		this.FoundationShade = [238, 215, 200];
		this.MatchFoundation = true;
		this.foudataionShades = foudataionShades;
		this.isAnalysisStated = false;
		this.resetFoundation = function () {
			btbpExample.settings.MatchFoundation = true;
			btbpExample.settings.Foundation = true;
		},
			this.reset = function () {
				example.settings.FLDPoints = false;
				example.settings.FLDTriangles = false;
				example.settings.Lipstick = false;
				example.settings.LipIntensity = 0.33;
				example.settings.LipGlossValue = 0.5;
				example.settings.Foundation = false;
				example.settings.FoundationIntensity = 0.3;
				example.settings.Complexion = true;
				example.settings.ComplexionIntensity = 0.5;
				example.settings.LipColor = [142, 0, 0];
				example.settings.FoundationShade = [238, 215, 200];
				example.settings.MatchFoundation = true;
				example.settings.foudataionShades = foudataionShades;
				example.settings.isAnalysisStated = false;

				setUpDataGUI();
				setUpLipstickShades();
				setUpFoundationShades();
				setupMirrorConfig();

			};


		this.saveImage = function () { saveImage() };
		this.setFoundationShade = function (index) {
			setUpFoundationShades();
			var foundationShadeContainer = dom.getElement("_foundationshades");
			var matchedItem = foundationShadeContainer.children[index];
			matchedItem.click();

			var popupDiv = document.createElement('div');
			popupDiv.setAttribute("class", "mathced_shade");
			popupDiv.innerHTML = "Your Match";
			matchedItem.appendChild(popupDiv);
			matchedItem.style.boxShadow = "1px 1px 10px 3px #B63031";
			//matchedItem.style.webKitboxShadow="1px 1px 10px 3px #747a86 !impotant";

			//foundationShadeContainer. window.scrollTo(30*index, 0);
			$('#_foundationshades').animate({ scrollLeft: 30 * index }, 500);
		};
	};


	example.settings = new DefaultSettings();
	setUpDataGUI();
	function setUpDataGUI() {
		var gui = new dat.GUI({ width: 320 });

		gui.add(example.settings, 'FLDPoints').name('Landmarks');
		gui.add(example.settings, 'FLDTriangles').name('Mask');
		//gui.add(example.settings, 'Lipstick');
		if (btbpExample.appConfig.BeautyFeatureList.indexOf("Lipstick") != -1) {
			gui.add(example.settings, 'LipIntensity', 0, 1).name('Lipstick intensity');
			gui.add(example.settings, 'LipGlossValue', 0, 1).name('Gloss intensity');
		}
		if (btbpExample.appConfig.BeautyFeatureList.indexOf("Foundation") != -1) {
			//gui.add(example.settings, 'Foundation');
			gui.add(example.settings, 'FoundationIntensity', 0, 1).name('Foundation coverage');
		}
		if (btbpExample.appConfig.BeautyFeatureList.indexOf("Complexion") != -1) {
			gui.add(example.settings, 'Complexion');
			gui.add(example.settings, 'ComplexionIntensity', 0, 1).name('Complexion evenness');
		}

		//gui.add(example.settings, "resetFoundation").name('Reset foundation match');
		//gui.add(example.settings, "saveImage").name('Downlaod Original');
		gui.closed = false;
		var customDataGUIContainer = document.getElementById('data-gui-container');
		customDataGUIContainer.innerHTML = "";
		gui.domElement.style.paddingBottom = "30px"
		customDataGUIContainer.appendChild(gui.domElement);
		
		var popupDiv = document.createElement('div');
		popupDiv.setAttribute("class", "settings_close");
		popupDiv.innerHTML = "Close";
		popupDiv.onclick = onSettingsClicked;
		customDataGUIContainer.appendChild(popupDiv);
	}

	setUpLipstickShades();
	var prevSelected = 0;
	function setUpLipstickShades() {
		prevSelected = 0;
		var lipShadeContainer = document.getElementById("_lipshades");
		lipShadeContainer.innerHTML = "";
		var div;
		for (var index in LipstickShades) {
			var shade = LipstickShades[index];
			div = document.createElement('li');

			if (index == 0) {
				div.setAttribute("class", "shade_selected no_color_shade");
				//var noShadeDiv = document.createElement('div');
				//noShadeDiv.setAttribute("class", "no_shade");
				//div.appendChild(noShadeDiv);
				var noShadeImg = document.createElement('img');
				noShadeImg.setAttribute("class", "no_shade_img");
				noShadeImg.src = "BTBP/img/None_icon.png";
				div.appendChild(noShadeImg);
			}
			else {
				div.setAttribute("class", "shade_deselected");
			}
			var shade = LipstickShades[index].color;
			div.style.background = "rgb(" + shade[0] + "," + shade[1] + "," + shade[2] + ")";
			div.tag = index;
			div.onclick = function () {
				lipShadeContainer.children[prevSelected].setAttribute('class', 'shade_deselected');
				var index = this.tag;
				var shade = LipstickShades[index];
				example.settings.LipColor = shade.color;
				this.setAttribute('class', 'shade_selected');

				prevSelected = index;

				if (index == 0) {
					example.settings.Lipstick = false;
				}
				else {
					example.settings.Lipstick = true;
				}
			};
			lipShadeContainer.appendChild(div);
		}
	}
	function updateBRFExample() {

		if (!paused) {

			if (stats.start) stats.start();

			var imageDataCanvas = dom.getElement("_imageData");

			imageData.update();				// depends on whether it is a webcam or image setup

			example.updateCurrentExample(	// depends on the chosen example
				btbpManager,
				imageDataCanvas.getContext("2d").getImageData(0, 0, resolution.width, resolution.height).data,
				drawing
			);

			if (stats.end) stats.end();
		}
	}

	setUpFoundationShades();
	var foundationPrevSelected = 0;
	function setUpFoundationShades() {
		foundationPrevSelected = 0;
		var foundationShadeContainer = dom.getElement("_foundationshades");
		foundationShadeContainer.innerHTML = "";
		var div;
		for (var index in foudataionShades) {
			var shade = foudataionShades[index];
			div = document.createElement('li');

			if (index == 0) {
				div.setAttribute("class", "shade_selected no_color_shade");
				var noShadeImg = document.createElement('img');
				noShadeImg.setAttribute("class", "no_shade_img");
				noShadeImg.src = "BTBP/img/None_icon.png";
				div.appendChild(noShadeImg);
			}
			else {
				div.setAttribute("class", "shade_deselected");
			}

			div.style.background = "rgb(" + shade[0] + "," + shade[1] + "," + shade[2] + ")";
			div.tag = index;
			div.onclick = function () {
				foundationShadeContainer.children[foundationPrevSelected].setAttribute('class', 'shade_deselected');
				var index = this.tag;
				var shade = foudataionShades[index];
				example.settings.FoundationShade = shade;
				this.setAttribute('class', 'shade_selected');

				foundationPrevSelected = index;

				if (index == 0) {
					example.settings.Foundation = false;
				}
				else {
					example.settings.Foundation = true;
				}
			};
			foundationShadeContainer.appendChild(div);


		}
	}

	function saveImage() {
		var download = document.getElementById("_saveImage");
		var image = document.getElementById("_imageData").toDataURL("image/png");
		download.setAttribute("href", image);
		download.click();
	}


	//deep-tag settings
	var BTBPMirrorUIConfig = {
		deepTagMenu:
		{
			isEnabled: true,
			list: [
				{
					featureName: "Gender",
					uiId: "gender_item",
					tagName: DeepTags.GENDER,
					isEnabled: false
				},
				{
					featureName: "Age",
					uiId: "age_item",
					tagName: DeepTags.AGEGROUP,
					isEnabled: false
				},
				{
					featureName: "Skin Type",
					uiId: "skin_type_item",
					tagName: DeepTags.SKINTYPE,
					isEnabled: false
				},
				{
					featureName: "Air Quality",
					uiId: "pollution_item",
					tagName: DeepTags.POLLUTION_AQI,
					isEnabled: false
				},
				{
					featureName: "Location",
					uiId: "location_item",
					tagName: DeepTags.GEOLOCATION_CITY,
					isEnabled: false
				},
				{
					featureName: "UV Index",
					uiId: "uv_item",
					tagName: DeepTags.UVINDEX,
					isEnabled: false
				}
			]
		},
		skinFeatureMenu:
		{
			isEnabled: true,
			list: [
				{
					featureName: "Wrinkles",
					tagName: DeepTags.WRINKLES_SEVERITY_SCORE,
					isEnabled: false
				},
				{
					featureName: "Acne",
					tagName: DeepTags.ACNE_SEVERITY_SCORE,
					isEnabled: false
				},
				{
					featureName: "Pores",
					tagName: DeepTags.PORES_SEVERITY_SCORE,
					isEnabled: false
				},
				{
					featureName: "Spots",
					tagName: DeepTags.SPOTS_SEVERITY_SCORE,
					isEnabled: false
				},
				{
					featureName: "Redness",
					tagName: DeepTags.REDNESS_SEVERITY_SCORE,
					isEnabled: false
				},
				{
					featureName: "Uneven SkinTone",
					tagName: DeepTags.UNEVEN_SKINTONE_SEVERITY_SCORE,
					isEnabled: false
				},
				{
					featureName: "Dark Circles",
					tagName: DeepTags.DARK_CIRCLES_SEVERITY_SCORE,
					isEnabled: false
				},
				{
					featureName: "Lips",
					tagName: DeepTags.LIP_ROUGHNESS_SEVERITY_SCORE,
					isEnabled: false
				},
				{
					featureName: "Dehydration",
					tagName: DeepTags.DEHYDRATION_SEVERITY_SCORE,
					isEnabled: false
				},
				{
					featureName: "Oiliness",
					tagName: DeepTags.OILINESS_SEVERITY_SCORE,
					isEnabled: false
				}
			]
		},
		beautyFeaturesMenu:
		{
			list: [
				{
					featureName: "Lipstick",
					isEnabled: false
				},
				{
					featureName: "Foundation",
					isEnabled: false
				},
				{
					featureName: "Complexion",
					isEnabled: false
				}
			]
		}
	};



	setupMirrorConfig();

	function setupMirrorConfig() {
		setupDeepTagMenu();
		setupFeatresMenu();
		setupBeautyFeatures();
		if((LicensedDeepTags.length+LicensedFeatureTags.length) > 0)
		{
			$("#deeptag_rejection_txt").show();
		}
		else{
			$("#deeptag_rejection_txt").hide();
		}

		if((btbpExample.appConfig.BeautyFeatureList.length+LicensedDeepTags.length+LicensedFeatureTags.length) > 0)
		{
			$("#restart_btn").show();
		}
		else{
			$("#restart_btn").hide();
		}

		btbpExample.config.isAutoRest = btbpExample.appConfig.auto_reset;
		btbpExample.config.resetTimeout = btbpExample.appConfig.auto_reset_time_interval;

		if (btbpExample.appConfig.show_settings) {
			$("#settings_btn").show();
		}
		else {
			$("#settings_btn").hide();
		}
	}

	function setupDeepTagMenu() {
		var deeptagMenuContainer = $("#tag_item_list_parent");
		if (BTBPMirrorUIConfig.deepTagMenu.isEnabled) {
			deeptagMenuContainer.show();
			LicensedDeepTags = [];
			for (var i = 0; i < BTBPMirrorUIConfig.deepTagMenu.list.length; i++) {
				var item = BTBPMirrorUIConfig.deepTagMenu.list[i];
				if (btbpExample.appConfig.DeepTagList.indexOf(item.featureName) != -1)//(item.isEnabled)
				{
					LicensedDeepTags.push(item.tagName);
					$("#" + item.uiId).show();
				}
				else {
					$("#" + item.uiId).hide();
				}
			}
			if (LicensedDeepTags.length == 0) {
				deeptagMenuContainer.hide();
			}

		}
		else {
			deeptagMenuContainer.hide();
		}
	}

	function setupFeatresMenu() {
		var featureMenuContainer = $("#concerns_list");
		if (BTBPMirrorUIConfig.skinFeatureMenu.isEnabled) {
			featureMenuContainer.show();
			var skinConcernsList = [];
			LicensedFeatureTags = [];
			for (var i = 0; i < BTBPMirrorUIConfig.skinFeatureMenu.list.length; i++) {
				var item = BTBPMirrorUIConfig.skinFeatureMenu.list[i];
				
				if (btbpExample.appConfig.SkinFeatureList.indexOf(item.featureName) != -1)//(item.isEnabled)
				{
					LicensedFeatureTags.push(item.tagName);
					var concern = new skinConcern();
					concern.Name = getFeatureNameByTagName(item.tagName);//item.featureName;
					concern.Severity = '0';
					skinConcernsList.push(concern);
					//$("#"+item.uiId).show();
				}
				else {
					//$("#"+item.uiId).hide();
				}
			}

			if (LicensedFeatureTags.length > 0) {
				setupFeatureResults(skinConcernsList);
			}
			else {
				featureMenuContainer.hide();
			}

		}
		else {
			featureMenuContainer.hide();
		}
	}

	function setupBeautyFeatures() {
		var featureMenuContainer = $("#controls_menu");
		var totalBeautyFeatures = BTBPMirrorUIConfig.beautyFeaturesMenu.list.length;
		var totalActiveBeautyFeatures = 0;
		if (totalBeautyFeatures > 0) {
			
			for (var i = 0; i < totalBeautyFeatures; i++) {
				var item = BTBPMirrorUIConfig.beautyFeaturesMenu.list[i];
				if (btbpExample.appConfig.BeautyFeatureList.indexOf(item.featureName) != -1) {
					switch (item.featureName) {
						case "Lipstick":
							$("#lbl_lipShades").show();
							$("#lipsShades_container").show();
							$("#lbl_lipShades").parent().css({ "height": "100%" });
							totalActiveBeautyFeatures++;
							break;
						case "Foundation":
							$("#lbl_foundationShades").show();
							$("#foundationshades_container").show();
							if (totalActiveBeautyFeatures > 0) {
								$("#lbl_lipShades").parent().css({ "height": "50%" });
								$("#lbl_foundationShades").parent().css({ "height": "50%" });
								onLipstickShades();
							}
							else {
								$("#lbl_lipShades").parent().css({ "height": "0%" });
								$("#lbl_foundationShades").parent().css({ "height": "100%" });
								onFoundationShades();
							}
							totalActiveBeautyFeatures++;
							break;
					}
					
				}
				else {
					switch (item.featureName) {
						case "Lipstick":
							$("#lbl_lipShades").hide();
							$("#lipsShades_container").hide();
							break;
						case "Foundation":
							$("#lbl_foundationShades").hide();
							$("#foundationshades_container").hide();
							break;

					}
				}
			}

			if (totalActiveBeautyFeatures == 0) {
				featureMenuContainer.hide();
			}
			else{
				featureMenuContainer.show();
			}

		}
		else {
			featureMenuContainer.hide();
		}
	}

	function getMessage(errorCode) {
		//console.log(errorCode)
		var message = "";
		switch (errorCode) {
			case cameraErrorCode.CAMERA_NOT_FOUND:
				message = "Camera is not available!";
				break;
			case cameraErrorCode.GET_USER_MEDIA_NOT_SUPPORTED:
				message = "Camera Api not supported!";
				break;
			case cameraErrorCode.SECURE_CONNECTION_ERROR:
				message = "Only secure origins are allowed!";
				break;
			case cameraErrorCode.PERMISSION_DINED:
				message = "Camera permission denied!";
				break;
			case cameraErrorCode.CAMERA_BUSY:
				message = "Camera is busy!";
				break;
			case cameraErrorCode.UNKNOWN_ERROR:
				message = "Unknown error!";
				break;
			case fileErrorCodes.NO_FILE_SELECTED:
				message = "No File selected!";
				break;
			case fileErrorCodes.FILE_FORMAT_NOT_SUPPORTED:
				message = "Invalid file format!<br/> Please select Image of type BMP, JPG or PNG";
				break;
			case fileErrorCodes.FILE_SIZE_TOO_LOW:
				message = "File size is too small!<br/> Please continue by uploading photo";
				break;
			case fileErrorCodes.FILE_SIZE_TOO_HIGHT:
				message = "File size is too large!<br/> Please uploading another image";
				break;
			case fileErrorCodes.FILE_READING_FAILED:
				message = "File Api not supported!";
				break;
			case fileErrorCodes.INTERVAL_ERROR:
				message = "Some thing went wrong!<br/> Please try again";
				break;
			case fileErrorCodes.FILE_API_NOT_SUPPORTED:
				message = "File Api not supported!<br/> Please try again";
				break;
		}
		return message;
	}

})();