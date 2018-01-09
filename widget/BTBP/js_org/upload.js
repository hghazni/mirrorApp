var Latitude = 0;
var Longitude = 0;

var Deep_Tag_key = btbpExample.mirrorOptions.key;

var Client = "BTBP"
var LicensedDeepTags = [];
var LicensedFeatureTags = [];
var MSMDeepTags = ["GENDER", "AGEGROUP", "DiscreteAge","SKINTYPE", "GEOLOCATION_CITY", "UVINDEX", "POLLUTION_AQI"]

var MSMSkinTags = ["WRINKLES_SEVERITY_SCORE", "ACNE_SEVERITY_SCORE", "REDNESS_SEVERITY_SCORE", "PORES_SEVERITY_SCORE", "SPOTS_SEVERITY_SCORE",  
 "UNEVEN_SKINTONE_SEVERITY_SCORE",  "DARK_CIRCLES_SEVERITY_SCORE", "DEHYDRATION_SEVERITY_SCORE", "LIP_ROUGHNESS_SEVERITY_SCORE","OILINESS_SEVERITY_SCORE"];
var DeepTags = {
    GENDER: "GENDER",
    AGEGROUP: "AGEGROUP",
    DiscreteAge: "DiscreteAge",
    SKINTYPE: "SKINTYPE",
    GEOLOCATION_CITY: "GEOLOCATION_CITY",
    UVINDEX: "UVINDEX",
    POLLUTION_AQI: "POLLUTION_AQI",

    WRINKLES_SEVERITY_SCORE: "WRINKLES_SEVERITY_SCORE",
    ACNE_SEVERITY_SCORE: "ACNE_SEVERITY_SCORE",
    PORES_SEVERITY_SCORE: "PORES_SEVERITY_SCORE",
    SPOTS_SEVERITY_SCORE: "SPOTS_SEVERITY_SCORE",
    REDNESS_SEVERITY_SCORE: "REDNESS_SEVERITY_SCORE",
    UNEVEN_SKINTONE_SEVERITY_SCORE: "UNEVEN_SKINTONE_SEVERITY_SCORE",
    DARK_CIRCLES_SEVERITY_SCORE: "DARK_CIRCLES_SEVERITY_SCORE",
    LIP_ROUGHNESS_SEVERITY_SCORE: "LIP_ROUGHNESS_SEVERITY_SCORE",
    DEHYDRATION_SEVERITY_SCORE:"DEHYDRATION_SEVERITY_SCORE",
    OILINESS_SEVERITY_SCORE: "OILINESS_SEVERITY_SCORE"
};

var uploadStopTimeout;
var ANALYZE_IMAGE_REQUEST_CODE;

function startAnalysis(canvas)
{
    if((LicensedDeepTags.length+LicensedFeatureTags.length) > 0)
    {

        console.log("Analysis started");
        $("#loader_deeptag_container").show();
        $("#deeptag_rejection_txt").hide();
        $("#deeptag_status_txt").text("Analyzing...");
        imageBase64String = onGetBase64FromCanvas(canvas);
       // getLicensedDeepTags();
       onImgUpload(imageBase64String);
    }
    
}
function onGetBase64FromCanvas(canvas)
{
    //var base64Img = canvas.toDataURL('image/png');
    var base64Img = canvas.toDataURL('image/jpeg', 1.0);
    //var base64ImgBmp = canvas.toDataURL('image/bmp');
    //alert(base64Img);
    return base64Img;
}
function getLicensedDeepTags()
{
    var url = getServiceURL() + "authorizedtags/" + Deep_Tag_key;
   // console.log(url);
    var success = function (response) {
        onGetLicensedTagsSuccess(response);
    };

    var error = function () {
        console.log("getLicensedDeepTags service call failed");
        hideProgress();
       // var msg = "Some thing went wrong, please try again.";
        var msg = "Please check your internet connection and try again.";
        var onTryAgain = function () {
            showProgress();
            getLicensedDeepTags();
        };
        customAlert.show(msg, onTryAgain, 'Try Again');
    };
    HttpClient.Get(url, success, error);
}

function onGetLicensedTagsSuccess(response)
{
    var jsonData = JSON.parse(response);
    LicensedTags = [];
    for (var i = 0; i < jsonData.length; i++) {
        LicensedTags.push(jsonData[i].TagName);
    }
   // console.log("LicensedTags : " + LicensedTags);
    try {
        if (LicensedTags.length == 0) {
            hideProgress();
            // var msg = "Some thing went wrong, please try again.";
            var msg = "No Tags found.";
            var onTryAgain = function () {
                showProgress();
                getLicensedDeepTags();
            };
            customAlert.show(msg, onTryAgain, 'Try Again');
            return;
        }
        else {

        }
    }
    catch (e) {

    }

    onImgUpload(imageBase64String);
}

function getTags() {
    var tags = [];
    for (var i = 0; i < MSMDeepTags.length; i++)
    {
        var tag = MSMDeepTags[i];
        if (LicensedDeepTags.indexOf(tag) > -1)
        {
            tags.push(tag);
        }
    }

    for (var i = 0; i < MSMSkinTags.length; i++)
    {
        var tag = MSMSkinTags[i];
        if (LicensedFeatureTags.indexOf(tag) > -1)
        {
            tags.push(tag);
        }
    }
    return tags;
}

var UPLOAD_TIME_LIMIT = 1000 * 60 * 3;

function onImgUpload(imageData) {
    ANALYZE_IMAGE_REQUEST_CODE = new Date().getTime();
    var analysisRequestCode = ANALYZE_IMAGE_REQUEST_CODE;
    clearTimeout(uploadStopTimeout);
    uploadStopTimeout = setTimeout(function () {
        var endTime = new Date().getTime();
        var seconds = (endTime - uploadStartTime) / 1000;
        console.log("Upload Time Out (in seconds) : " + seconds);

        console.log("uploadStopTimeout happend...");
        var msg = "Please check your internet connection";
        onUploadFailed(msg);
    }, UPLOAD_TIME_LIMIT);

    var uploadStartTime = new Date().getTime();
    var UserID = sessionStorage.Email;
    UserID = new Date().getTime() + "@btbp.org";
    var tags = getTags();

    if (imageData.indexOf(',') != -1)
    {
        imageData = imageData.split(',')[1];
    }
    var strings = imageData.match(/.{1,1024}/g);

    //console.log("Latitude :" + Latitude + " -- Longitude :" + Longitude);
    /*
	 var options = [
		 { Key: "IsGray_EnvDamage", Value: deeptagOptions.IsGray },
		 { Key: "IsSoftBG_EnvDamage", Value: deeptagOptions.IsSoftBackground },
		 { Key: "ContrastLevel_EnvDamage", Value: deeptagOptions.ContrastLevel }
	 ];
    */
    jsonText = JSON.stringify({
        "APIKey": Deep_Tag_key,
        "UserId": UserID,
        "ClientId": Client,
        "Latitude": Latitude,
        "Longitude": Longitude,
        "Tags": tags,
        "ImageBytes": strings
        /*,
		"Options": options*/
    });

    //console.log(JSON.stringify(jsonText));
    var url = getServiceURL() + "GetTags";
    var xhr = createCORSRequest('POST', url);

    xhr.onload = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            //sucess case
            clearTimeout(uploadStopTimeout);
            var data = JSON.parse(xhr.responseText);
            var endTime = new Date().getTime();
            var seconds = (endTime - uploadStartTime) / 1000;
           // console.log("Time taken to Analyze (in seconds) : " + seconds);
            onDeepTagSuccess(data, analysisRequestCode);
        }
        else if (xhr.status == 401) {
            clearTimeout(uploadStopTimeout);
            var data = JSON.parse(xhr.responseText);
            console.log("Unauthorized service call");
            var myJson = JSON.stringify(data);
            onImageRejected(myJson);
        }
        else {
            //failure case
            clearTimeout(uploadStopTimeout);
            var data = JSON.parse(xhr.responseText);
            var myJson = JSON.stringify(data);
            console.log("Operation failed response");
            onImageRejected(myJson);
        }
    };

    xhr.onerror = function () {
        var msg = "Please check your internet connection";
        onUploadFailed(msg);
    };

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(jsonText)
}

function skinConcern()
{
    this.Name = "";
    this.Image = "";
    this.Severity = 0;
}

function DeepTagInfo()
{
    this.Gender = "";
    this.Age = "";
    this.skinType = "";
    this.Pollution = "";
    this.Location = "";
    this.UVIndex = "";
}

function onDeepTagSuccess(data, requestCode)
{
   // getClimateDetails();
   if(requestCode != ANALYZE_IMAGE_REQUEST_CODE)
   {
       console.log("analysis results skipped");
        return;
   }
    var tags = data.Tags;
    var totalTags = tags.length;
    var lipBase64Image = "";

    var wrinkle = new skinConcern();
    var acne = new skinConcern();
    var pores = new skinConcern();
    var spots = new skinConcern();
    var redness = new skinConcern();
    var skintone = new skinConcern();
    var darkCircles = new skinConcern();
     var envDamage = new skinConcern();
     

    var deepTagInfo = new DeepTagInfo();

    var skinConcernsList = [];
    for (var i = 0; i < totalTags; i++) {
        var tag = tags[i];
        
        if(MSMDeepTags.indexOf(tag.TagName) != -1)
        {
            switch (tag.TagName) {
                case DeepTags.GENDER:
                    if (tag.Status) {
                        var gender = tag.TagValues[0].Value.toUpperCase();
                        deepTagInfo.Gender = gender;
                    }
                    else {
                        deepTagInfo.Gender = "NA";
                        //onImageRejected(tag.Message);
                        //return;
                    }
                    break;
                case DeepTags.AGEGROUP:
                    if (tag.Status) {
                        deepTagInfo.Age = tag.TagValues[0].Value;
                    }
                    else {
                        deepTagInfo.Age = "NA";
                        //onImageRejected(tag.Message);
                        //return;
                    }
                    break;
    
                case DeepTags.SKINTYPE:
                if (tag.Status) {
                    deepTagInfo.skinType = tag.TagValues[0].Value;
                }
                else {
                    deepTagInfo.skinType = "NA";
                    //onImageRejected(tag.Message);
                    //return;
                }
                break;
                case DeepTags.GEOLOCATION_CITY:
                    if (tag.Status) {
                        deepTagInfo.Location = tag.TagValues[0].Value;
                    }
                    else {
                        deepTagInfo.Location = "NA";
                        //onImageRejected(tag.Message);
                        //return;
                    }
                    break;
                case DeepTags.UVINDEX:
                    if (tag.Status) {
                        deepTagInfo.UVIndex = tag.TagValues[0].Value;
                    }
                    else {
                        deepTagInfo.UVIndex = "NA";
                        //onImageRejected(tag.Message);
                        //return;
                    }
                    break;
                case DeepTags.POLLUTION_AQI:
                    if (tag.Status) {
                        deepTagInfo.Pollution = tag.TagValues[0].Value;
                    }
                    else {
                        deepTagInfo.Pollution = "NA";
                        //onImageRejected(tag.Message);
                        //return;
                    }
                    break;
                }    
        }
        else if(MSMSkinTags.indexOf(tag.TagName) != -1)
        {
            if (tag.Status) {
                var concern = new skinConcern();
                concern.Name = getFeatureNameByTagName(tag.TagName);
                concern.Severity = tag.TagValues[0].Value;
                if(concern.Name.length != 0)
                skinConcernsList.push(concern);
            }
            else {
                onImageRejected(tag.Message);
                return;
            }
        }
    }

    /*
    var skinConcernsSorted = []
    for (var i = 0; i < skinConcernsList.length; i++) {
        if(skinConcernsList[i].Name.length != 0)
        {
            skinConcernsSorted.push(skinConcernsList[i]);
        }
    }
    */
	
    // skinConcernsSorted.sort(function (a, b) {
    //     return parseFloat(b.Severity) - parseFloat(a.Severity);
    // });

  // skinConcernsSorted.unshift(envDamage);
    $("#loader_deeptag_container").hide();
    setupResults(skinConcernsList);
    showDeepTagInfo(deepTagInfo);
   
}


function getFeatureNameByTagName(tagName)
{
    var featureName = "";
    switch (tagName) {
        case DeepTags.GENDER:
        featureName = "Gender";
        break;
        case DeepTags.AGEGROUP:
        featureName = "Gender";
            break;

        case DeepTags.SKINTYPE:
        featureName = "Gender";
        break;
        case DeepTags.GEOLOCATION_CITY:
        featureName = "Gender";
            break;
        case DeepTags.UVINDEX:
        featureName = "Gender";
            break;
        case DeepTags.POLLUTION_AQI:
        featureName = "Gender";
            break;


        case DeepTags.WRINKLES_SEVERITY_SCORE:
            featureName = "Wrinkles";
            break;
        case DeepTags.ACNE_SEVERITY_SCORE:
            featureName = "Acne";
            break;
      
        case DeepTags.PORES_SEVERITY_SCORE:
            featureName = "Pores";
            break;
       
        case DeepTags.SPOTS_SEVERITY_SCORE:
            featureName = "Spots";
            break;

        case DeepTags.REDNESS_SEVERITY_SCORE:
            featureName = "Redness";
            break;
        case DeepTags.UNEVEN_SKINTONE_SEVERITY_SCORE:
            featureName = "Uneven Skintone";
            break;
        case DeepTags.DARK_CIRCLES_SEVERITY_SCORE:
            featureName = "Dark Circles";
            break;
        case DeepTags.LIP_ROUGHNESS_SEVERITY_SCORE:
        featureName = "Lip Health";
            break;
        case DeepTags.OILINESS_SEVERITY_SCORE:
            featureName = "Oiliness";
            break;
        case DeepTags.DEHYDRATION_SEVERITY_SCORE:
            featureName = "Dehydration";
            break;
    }
    return featureName;
}


function showDeepTagInfo(deepTagInfo) {
    try {
        var displayedItemsCount = 0;
        var gender = deepTagInfo.Gender;
        if (gender.length != 0) {
            if (gender.indexOf("NA") != -1)
            {
                $("#Male_Female_img").attr("src", "BTBP/img/Gender_Disabled_Icon.png");
            }
            else
            {
                var genderStr = ((gender == 'MALE') ? "Male" : "Female");
                $("#Male_Female_img").attr("src", "BTBP/img/" + genderStr + ".png");
               
                $('#txt_gender').html(genderStr);
            }
            $("#Male_Female_img").show();
            displayedItemsCount++;
        }
        else {
            $('#gender_item').hide();
        }

        if (deepTagInfo.skinType.length != 0) {
            var skinType = deepTagInfo.skinType;
            if (skinType.indexOf("NA") != -1)
            {
                $("#skin_type_selected_img").hide();
            }
            else{
                var skinTypeImgStr =  "SkinType_"+ skinType;
                $("#skin_type_selected_img").show();
                $("#skin_type_selected_img").attr("src", "BTBP/img/skintype/" + skinTypeImgStr + ".png");
            }
            $('#skin_type_index').html(skinType);
            
            displayedItemsCount++;
        }
        else {
            $('#skin_type_item').hide();
        }
        
        if (deepTagInfo.Age.length != 0) {
            $('#age_index').html(deepTagInfo.Age);
            displayedItemsCount++;
        }
        else {
            $('#age_item').hide();
        }

        if (deepTagInfo.Pollution.length != 0) {
            $('#pollution_index').html(deepTagInfo.Pollution);
            displayedItemsCount++;
        }
        else {
            $('#pollution_item').hide();
        }

        if (deepTagInfo.Location.length != 0) {
            $('#txt_location_value').html(deepTagInfo.Location);
            displayedItemsCount++;
        }
        else {
            $('#location_item').hide();
        }

        if (deepTagInfo.UVIndex.length != 0) {
            $('#uv_index').html(deepTagInfo.UVIndex);
            displayedItemsCount++;
        }
        else {
            $('#uv_item').hide();
        }

        if (displayedItemsCount == 0) {
            $(".results_bottom_panel_container").hide();
        }
        else {
            $(".results_bottom_panel_container").show();
        }
    }
    catch (e) {
        console.log("Exception at showDeepTagInfo :" + e)
    }
}


function onImageRejected(msg)
{
    var imageRejection = {
        code: "0",
        rejection_reason: "Error",
        rejection_content: msg
    };
    console.log(msg);
    $("#loader_deeptag_container").hide();
	$("#deeptag_rejection_txt").show();
    $("#deeptag_rejection_txt").text(msg);
    
    setTimeout(function()
    {
        onReanalyze();
    }, 1000*6);
    //showRejectionDetails(imageRejection);
    //hideProgress();
}

function onReanalyze()
{
    btbpExample.settings.isAnalysisStated = false;
    $("#loader_deeptag_container").hide();
	$("#deeptag_rejection_txt").show();
	$("#deeptag_rejection_txt").text("Please align your face within the red box");
}

function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();

    if ("withCredentials" in xhr) {
        // XHR for Chrome/Firefox/Opera/Safari.
        xhr.open(method, url, true);

    } else if (typeof XDomainRequest != "undefined") {
        // XDomainRequest for IE.
        xhr = new XDomainRequest();
        xhr.open(method, url);

    } else {
        // CORS not supported.
        xhr = null;
    }
    return xhr;
}


function onUploadFailed(msg)
{
    clearTimeout(uploadStopTimeout);
    onImgUpload(imageBase64String);
    /*
    var onTryAgain = function () {
        onImgUpload(imageBase64String);
    };
    customAlert.show(msg, onTryAgain, 'Try Again');
    */
}


var prevSelectedSkinConern = 0;
var concernList = [];
function setupFeatureResults(skinconcernList) {
    prevSelectedSkinConern = 0;
    concernList = skinconcernList;
  
    try{
        //getElement('result_img').src = "data:image/jpg;base64," + data.OriginalPath;

        if (skinconcernList == null && skinconcernList.length != 0) {
            console.log("featureList mull ");
            $(".results_left_panel_container").hide();
            return;
        }
        else {
            $(".results_left_panel_container").show();
        }
        var totalConcerns = skinconcernList.length;

        var concernDimen = 90;
        if (isMobile()) {
            concernDimen = 100;
        }
        else {
            concernDimen = 90;
        }

        var resultsContainer = getElement('concerns_list');
        resultsContainer.innerHTML = "";
        var container = getElement('app_container');

       // resultsContainer.style.maxHeight = (container.clientHeight * 0.6) + "px";

       // resultsContainer.style.height = ((concernDimen * totalConcerns) + (20 * totalConcerns) + 10) + "px";
        for (var i = 0; i < totalConcerns; i++) {
            var concernObj = skinconcernList[i];
            var severity = concernObj.Severity;
            var concernDiv = document.createElement('div');
            concernDiv.index = i;
           
            concernDiv.style.width = concernDimen + "px";

            var concernSeverityDiv = document.createElement('div');
            concernSeverityDiv.setAttribute('class', 'concern_severity');
            var canvasWidth = parseInt(concernDimen * 0.7);
            concernSeverityDiv.style.height = canvasWidth + "px";
			if(severity.indexOf("0") != -1)
			{
				var canvas = document.createElement('canvas');
				canvas.width = canvasWidth;
				canvas.height = canvasWidth;

				drawCircle(canvas, 4);
				//drawSeverity(canvas, severity, 4, 16);
				concernSeverityDiv.appendChild(canvas);
			}
			else
			{	
				var canvas = document.createElement('canvas');
				canvas.width = canvasWidth;
				canvas.height = canvasWidth;

				drawCircle(canvas, 4);
				drawSeverity(canvas, severity, 4, 16);
				concernSeverityDiv.appendChild(canvas);
			}
            var concernLabelDiv = document.createElement('div');
            concernLabelDiv.setAttribute('class', 'txt_concern');
            concernLabelDiv.innerHTML = concernObj.Name;

            concernDiv.appendChild(concernSeverityDiv);
            concernDiv.appendChild(concernLabelDiv);

            resultsContainer.appendChild(concernDiv);
        }
    }
    catch(e)
    {
        console.log("Exception at setupResults :"+e);
    }
}

var prevSelectedSkinConern = 0;
var concernList = [];
function setupResults(skinconcernList) {
    prevSelectedSkinConern = 0;
    concernList = skinconcernList;
  
    try{
        //getElement('result_img').src = "data:image/jpg;base64," + data.OriginalPath;

        if (skinconcernList == null && skinconcernList.length != 0) {
            console.log("featureList mull ");
            $(".results_left_panel_container").hide();
            return;
        }
        else {
            $(".results_left_panel_container").show();
        }
        var totalConcerns = skinconcernList.length;

        var concernDimen = 90;
        if (isMobile()) {
            concernDimen = 100;
        }
        else {
            concernDimen = 90;
        }

        var resultsContainer = getElement('concerns_list');
        resultsContainer.innerHTML = "";
        var container = getElement('app_container');

        //resultsContainer.style.maxHeight = (container.clientHeight * 0.6) + "px";

        //resultsContainer.style.height = ((concernDimen * totalConcerns) + (20 * totalConcerns) + 10) + "px";
        for (var i = 0; i < totalConcerns; i++) {
            var concernObj = skinconcernList[i];
            var severity = concernObj.Severity;
            var concernDiv = document.createElement('div');
            concernDiv.index = i;
          
            concernDiv.style.width = concernDimen + "px";


            var concernSeverityDiv = document.createElement('div');
            concernSeverityDiv.setAttribute('class', 'concern_severity');
            var canvasWidth = parseInt(concernDimen * 0.7);
            concernSeverityDiv.style.height = canvasWidth + "px";
		
            var canvas = document.createElement('canvas');
            canvas.width = canvasWidth;
            canvas.height = canvasWidth * 0.9;

            drawCircle(canvas, 4);
            drawSeverity(canvas, severity, 4, 16);
            concernSeverityDiv.appendChild(canvas);
			
            var concernLabelDiv = document.createElement('div');
            concernLabelDiv.setAttribute('class', 'txt_concern');
            concernLabelDiv.innerHTML = concernObj.Name;

            concernDiv.appendChild(concernSeverityDiv);
            concernDiv.appendChild(concernLabelDiv);

            resultsContainer.appendChild(concernDiv);
        }
    }
    catch(e)
    {
        console.log("Exception at setupResults :"+e);
    }
}


function onSkinConcernClicked(ele) {
    var resultsContainer = getElement('concerns_list');
    var prevSkinConcern = resultsContainer.children[prevSelectedSkinConern];
    try {
        onDeselectedConcern(prevSkinConcern);
    }
    catch (e) {
		
    }
    onSelectedConcern(ele);
    prevSelectedSkinConern = ele.index;
    var image = getElement('result_img')
    image.src = dataEncodingHeader + concernList[prevSelectedSkinConern].Image;
    initImage('result_img');
    /*
    image.onload = function () {
        initImage('result_img');
    };
    */
    //console.log(ele.index);
};

function onSelectedConcern(concernDiv) {
    concernDiv.className = 'skin_concern skin_concern_selected';
}

function onDeselectedConcern(concernDiv) {
    concernDiv.className = 'skin_concern skin_concern_deselected';
}

function drawSeverity(canvas, valueCount, lineWidth, fontSize) {
    canWidth = canvas.width;
    var ctx = canvas.getContext("2d");
    font = "bold " + fontSize + "pt Arial";
    textPointX = (canWidth - (fontSize / 1.5)) / 2;
    textPointY = (canWidth + (fontSize / 1)) / 2;
    ctx.beginPath();
    var val = valueCount;
    temp = 1.50001 + (0.4 * val);
    //ctx.arc(canWidth / 2, canWidth / 2, (canWidth / 3), 0, 1.0 * Math.PI, 0);
    ctx.arc(canWidth / 2, canWidth / 2, canWidth / 3, 1.5 * Math.PI, temp * Math.PI, 0);
    ctx.lineWidth = lineWidth;
    ctx.font = font;
    ctx.fillStyle = "white";
    ctx.fillText(val, textPointX, textPointY);
    ctx.strokeStyle = "#B63031";
    ctx.stroke();
}

function drawCircle(canvas, lineWidth) {
    canWidth = canvas.width;
    var ctx = canvas.getContext("2d");
    ctx.beginPath();
    temp = 1.50001 + (0.4 * 5);
    ctx.arc(canWidth / 2, canWidth / 2, canWidth / 3, 1.5 * Math.PI, temp * Math.PI, 0);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = "#747a86";
    ctx.stroke();
}



function clearClimateDetails()
{
    document.getElementById("pollution_index").innerHTML = "";
    document.getElementById("txt_pollution_value").innerHTML = "";
    document.getElementById("txt_location_value").innerHTML = "";//+ "(" + response.Country + ")";
    document.getElementById("uv_index").innerHTML = "";
    document.getElementById("txt_uv_value").innerHTML = "";
    document.getElementById("skin_type_index").innerHTML = "";
    document.getElementById("age_index").innerHTML = "";
    document.getElementById("txt_gender").innerHTML = "";
    
    

    $("#skin_type_selected_img").hide();
    $("#Male_Female_img").attr("src", "BTBP/img/Gender_Disabled_Icon.png");
}
//Deep tag region

function getDeepTagInfo(imageId) {
    var url = getServiceURL() + "GetDeepTagInfo/" + imageId + "/true" + "?timestamp=" + new Date().getTime();
    var success = function (response) {
        setUpDeepTagResults(response);
    };
    var error = function () {
        console.log("CallDeepTagService service call failed");
    };
    HttpClient.Get(url, success, error);
}

function setUpDeepTagResults(results) {
    var taglist = [];
    taglist = JSON.parse(results);
    for (var i = 0; i < taglist.Tags.length; i++) {
        if (taglist.Tags[i].TagName == "GENDER") {
            //if(taglist.Tags[i].TagValue == "Female")
            $("#Male_Female_img").attr("src", "BTBP/img/" + taglist.Tags[i].TagValue + ".png");
            $('#txt_gender').html = "";
            document.getElementById('txt_gender').innerHTML = taglist.Tags[i].TagValue.toUpperCase();
        }
        else if (taglist.Tags[i].TagName == "AGE") {
            document.getElementById('age_index').innerHTML = taglist.Tags[i].TagValue;
        }
    }
}

var isResultsBottomPanel = true;
function toggleResultsBottonPanel() {
    var degrees = 0;
    if (isResultsBottomPanel) {
        isResultsBottomPanel = false;
        degrees = 0;
        $("#toggle_bottom_results_panel_img").css({ 'transform': 'rotate(' + degrees + 'deg)' });
        $("#tag_item_list_parent").slideUp();
    }
    else {
        isResultsBottomPanel = true;
        degrees = 180;
        $("#toggle_bottom_results_panel_img").css({ 'transform': 'rotate(' + degrees + 'deg)' });
        $("#tag_item_list_parent").slideDown();
    }

}

function getLocation() {
    if (navigator.geolocation)
    {
        navigator.geolocation.getCurrentPosition(onSuccessLocation, onErrorLocation);
    }
}
function onErrorLocation(error) {
    try{
        switch (error.code) {
            case error.PERMISSION_DENIED:
                console.log("User denied the request for Geolocation.");
                break;
            case error.POSITION_UNAVAILABLE:
                console.log("Location information is unavailable.");
                break;
            case error.TIMEOUT:
                console.log("The request to get user location timed out.");
                break;
            case error.UNKNOWN_ERROR:
                console.log("An unknown error occurred.");
                break;
        }
    }
    catch(e)
    {
        console.log("Exception at onErrorLocation :"+e);
    }
    
}

function onSuccessLocation(position) {
    //alert(position);
    Longitude = position.coords.longitude;
    Latitude = position.coords.latitude;
}
