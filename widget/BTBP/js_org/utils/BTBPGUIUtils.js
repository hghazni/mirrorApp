// BTBP example setup and handling:
//
// Init everything:
// + image data (either webcam or picture)
// + BTBP SDK with the size of the image data
// + Set all the parameters for BTBP according to the chosen example
// + Reinit if image data size changes

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
		$("#start_Button").hide();
		$("#loader_launch_screen").show();
		loaderInterval = setInterval(function () {
			onStartClicked();
		}, 1000);
	}
}

function onRetryClicked() {
	window.location.reload();

}

function onRestartClicked() {
	btbpExample.settings.reset();
	onReanalyze();
	clearClimateDetails();
	onLipstickShades();
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
		resetTimeout: 60  /*in seconds*/
	};
})();