var flag = 0;
var count=1;
var _analytics = true;
var isServiceFail;

var dataEncodingHeader = "data:image/jpeg;base64,";


function CustomAlert() {
    var callBack;
    var content = '<div class="alertBox"><div><!--<img class="custom_alert_close" onclick="customAlert.hide();" src="img/desktop/Desktop_CheckCircle_normal.png"/><br/>--><div id="alertMsg">msg here</div><br/><div id="CA_ok_label" class="btn_black" onclick="customAlert.hide();">ok</div></div></div>';
    this.show = function (msg, callBackFun, labelName) {
        callBack = callBackFun;
        log(msg);
        var div = document.createElement('div');
        div.innerHTML = content;
        div.setAttribute('class', 'mask');
        div.id = "customAlert";
        document.getElementById("btbp-container").appendChild(div);
        //document.body.appendChild(div);
        getElement('alertMsg').innerHTML = msg;
        getElement('CA_ok_label').innerHTML = (labelName == undefined) ? "OK" : labelName;
        getElement('customAlert').style.display = "table";
        disableScrolling();
    };

    this.hide = function () {
        //getElement('customAlert').style.display="none";
        var div = getElement('customAlert');
        //document.body.removeChild(div);
        document.getElementById("btbp-container").removeChild(div);
        skipAnalysis = false;
        enableScrolling();
        try {
            callBack();
        }
        catch (e) {
            console.log(e);
        }
    };

}
var customAlert = new CustomAlert();

 
 function CustomConfirm()
 {
	var okCallBack;
	var cancelCallBack;
	var content = '<div class="alertBox"><div><div id="alertMsg">msg here</div><br/><div id="CA_ok_label" class="btn_black" onclick="customConfirm.ok();">ok</div><div id="CA_cancel_label" class="btn_black" onclick="customConfirm.cancel();" style="margin-left:15px;">cancel</div></div></div>';
	this.show = function(msg,okCallBackFun,cancelCallBackFun)
	{
		okCallBack = okCallBackFun;
		cancelCallBack = cancelCallBackFun;
		log(msg);
		var div = document.createElement('div');
		div.innerHTML = content;
		div.setAttribute('class','mask');
		div.id="customAlert";
		document.getElementById("btbp-container").appendChild(div);
		getElement('alertMsg').innerHTML = msg;
		getElement('CA_ok_label').innerHTML = "OK";
		getElement('CA_cancel_label').innerHTML = "Cancel";
		getElement('customAlert').style.display="table";
		disableScrolling();
		
	};
	
	this.ok = function()
	{
		var div = getElement('customAlert');
		document.getElementById("btbp-container").removeChild(div);
		enableScrolling();
		try{
			okCallBack();
		}
		catch(e)
		{
		}
	};
	
	this.cancel = function()
	{
		var div = getElement('customAlert');
		document.getElementById("btbp-container").removeChild(div);
		enableScrolling();
		try{
		cancelCallBack();
		}
		catch(e)
		{
		}
	};
	
	
 }
  var customConfirm = new CustomConfirm();

 function enableScrolling()
{
	document.body.removeAttribute('class','stop_scrolling');
}
function disableScrolling()
{
	document.body.setAttribute('class','stop_scrolling');
}
function CreateSessionId()
{
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var string_length = 15;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
    }
	sessionStorage.sessionId = randomstring;
}
function checkAndGetCookie() {
    var username=getCookie("userEmailIDS");
    if (username!="") {
	     return username;
        //alert("Welcome again " + username);
    } else {
			var emailString = createEmailId_N() ;
            setCookie("userEmailIDS", emailString, 365);
			return emailString ;
        }
}
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
	var dominePath = "path=/"
    document.cookie = cname + "=" + cvalue + "; " + expires+";"+dominePath;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}

function createEmailId_N(){
	 var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
            var string_length = 15;
            var randomstring = '';
            for (var i = 0; i < string_length; i++) {
                var rnum = Math.floor(Math.random() * chars.length);
                randomstring += chars.substring(rnum, rnum + 1);
            }
			return randomstring+"@btbp.org"; 
}

function CreateEmailId()
{
           /*
            var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
            var string_length = 15;
            var randomstring = '';
            for (var i = 0; i < string_length; i++) {
                var rnum = Math.floor(Math.random() * chars.length);
                randomstring += chars.substring(rnum, rnum + 1);
            }
			*/
			/*var cdata=getCookieData("Email");
			if(cdata==false){
				setCookieData("Email",randomstring+"@ids.com");
				var cemail=getCookieData("Email");
				setSessionData("Email",cemail);
			}
			else{
				var cemail=getCookieData("Email");
				setSessionData("Email",cemail);
			}
			setSessionData("Email",randomstring+"@ids.com");
			//sessionStorage.Email = randomstring+"@ids.com";
			*/
			 //sessionStorage.Email = checkAndGetCookie();
			 try{
				 var emailID = checkAndGetCookie() ;
				 setSessionData("Email",emailID);
			 }
			 catch(e){
				 console.log(e);
			 }
}

function httpClient() {
    this.Post = function(serviceUrl, data, onSuccess, onError) {
        try {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', serviceUrl, true);
            //log("url : "+serviceUrl);
            //log("data : "+data);
            xhr.onreadystatechange = function() {
                //log(xhr.status +"--"+xhr.readyState);
                if (xhr.status == 200 && xhr.readyState == 4) {
                    onSuccess(xhr.responseText);
                }
                if (xhr.status == 400 || xhr.status == 404) {
                    onError();
                }
            }
            xhr.onerror = function() {
                onError();
            }
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(data);
        } catch (e) {
            log(e);
        }
    };

    this.Get = function(serviceUrl, onSuccess, onError) {
        try {
            //log("url : "+serviceUrl);
            var xhr = new XMLHttpRequest();
            xhr.open('GET', serviceUrl, true);
            //log(xhr.status);
            xhr.onreadystatechange = function() {
                if (xhr.status == 200 && xhr.readyState == 4) {
                    onSuccess(xhr.responseText);
                }
                if (xhr.status == 400) {
                    onError();
                }
            }
            xhr.onerror = function() {
                onError();
            }
            xhr.send();
        } catch (e) {
            log(e);
        }
    };

}
var HttpClient = new httpClient();



function getServiceURL() {
    var url = "\x68\x74\x74\x70\x73\x3A\x2F\x2F\x61\x70\x69\x2E\x62\x74\x62\x70\x2E\x6F\x72\x67\x2F\x64\x65\x65\x70\x74\x61\x67\x2F\x41\x70\x70\x73\x65\x72\x76\x69\x63\x65\x2E\x73\x76\x63\x2F";
    return url;
}


function log(str) {
    console.log(str);
}


function setCookieData(key, value){
	if (isStorage() && isCookiesEnabled()) {
        try {
            var d = new Date();
			d.setTime(d.getTime() + (365*20*24*60*60*1000));
			var expires = "expires="+ d.toUTCString();
			document.cookie = key + "=" + value + ";" + expires + ";path=/";
        } 
		catch (e) {
            console.log(e);
        }
    } else {
        console.log("cookiesStorageError");
    }
}
function getCookieData(email) {
	if (isStorage() && isCookiesEnabled()) {
        try {
    var name = email + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
		else{
			return false;
		}
    }
    return "";
	}
	
	catch (e) {
            console.log(e);
        }
    } else {
        console.log("cookiesStorageError");
    }
}

function setSessionData(key, value) {

    if (isStorage() && isCookiesEnabled()) {
        try {
            sessionStorage.setItem(key, value);
        } catch (e) {
            console.log(e);
        }
    } else {
        customAlert1.show("cookiesStorageError");
    }
}

function getSessionData(key) {
    if (isStorage() && isCookiesEnabled()) {
        try {
            var data = sessionStorage.getItem(key);
            return data;
        } catch (e) {
            console.log(e);
        }
    } else {
        console.log("cookiesStorageError");
    }
    return "";
}

function removeSessionData(key) {
    if (isStorage() && isCookiesEnabled()) {
        try {
            var data = sessionStorage.removeItem(key);
            return data;
        } catch (e) {
            console.log(e);
        }
    } else {
        console.log("cookiesStorageError");
    }
}

function isCookiesEnabled() {
    var cookiesEnabled = navigator.cookieEnabled;
    if (!cookiesEnabled) {
        return false;
    }
    return true;
}

function isStorage() {
    if (typeof Storage != 'undefined') {
	
		try{
			sessionStorage.test="test";
		console.log("test storage"+sessionStorage)
		}
		catch(e){
			return false;
		}
        return true;
    }
    return false;
}


function setDisplay(id, display) {
    document.getElementById(id).style.display = display;
}


var AnalyticsInfo= [];
function ScreenTracking(screenName,cmt)
{ 
	//alert("hello2");
	try{
  if(sessionStorage.CurrentScreenName == undefined || sessionStorage.CurrentScreenName == "")
  {
	// alert("hello1");
    sessionStorage.CurrentScreenName = screenName;
	sessionStorage.StartTime = new Date().getTime(); 
    sessionStorage.comment = cmt;

	var TotalTime =  new Date().getTime() - sessionStorage.StartTime;
	AnalyticsInfo.push({"ScreenCode":sessionStorage.CurrentScreenName, "TimeSpent":(TotalTime/1000).toFixed(1),"comments": sessionStorage.comment});
  }
  else
  {
	 // alert("hello");
    if(sessionStorage.comment == undefined)
	 comment = 0;
	 
    var TotalTime =  new Date().getTime() - sessionStorage.StartTime;
	AnalyticsInfo.push({"ScreenCode":sessionStorage.CurrentScreenName, "TimeSpent":(TotalTime/1000).toFixed(1),"comments": sessionStorage.comment});
	
	sessionStorage.CurrentScreenName = screenName;
	sessionStorage.comment = cmt;
    sessionStorage.StartTime = new Date().getTime();
  }
	}
	catch(e){
	
	}setTimeout(function(){
	//storeAnalytics();
	}
	,120);
}

function validateStorageOnLoad(){
	if(isStorage() && isCookiesEnabled())
	{
		
	}
	else{
		customAlert1.show("please enable session storage and cookies");
	}
}


function getSessionData(key)
{
	if(isStorage() && isCookiesEnabled())
	{
		try{
		var data = sessionStorage.getItem(key);
		return data;
		}
		catch(e)
		{
			console.log(e);
		}
	}
	else{
		console.log("cookiesStorageError");
	}
	return "";
}
function removeSessionData(key)
{
	if(isStorage() && isCookiesEnabled())
	{
		try{
		var data = sessionStorage.removeItem(key);
		return data;
		}
		catch(e)
		{
			console.log(e);
		}
	}
	else{
		console.log("cookiesStorageError");
	}
}
function storeAnalytics()
{
  if(AnalyticsInfo.length == 0)
   {
        //    var TotalTime =  new Date().getTime() - StartTime;
        //    AnalyticsInfo.push({"ScreenCode":CurrentScreenName, "TimeSpent":(TotalTime/1000).toFixed(1),"comments": 0});
              return;
   }
   
   url=getServiceURL()+"SaveAnalyticsInfo?value="+ new Date().getTime();
   var jsonText3 = JSON.stringify({"AnalyticsDetails":AnalyticsInfo,"EmailID":sessionStorage.Email, "SesionID":sessionStorage.sessionId});

	   // console.log(jsonText3);

		var success = function(response){
	    
		}; 
		
		var error = function()
		{
 
		};
		
		
		
		if(_analytics)
		{
			log(jsonText3);
			
			setTimeout(function(){
			HttpClient.Post(url,jsonText3,success,error);},500);
			AnalyticsInfo = [];
		}
}




function getElement(id){return document.getElementById(id);}




function checkAndGetBrowserCookie() {
    var username=getCookie("browserCookie");
    if (username!="") {
	     return username;
        //alert("Welcome again " + username);
    } else {
            setCookie("browserCookie", CreateBrowserCoockie(), 365);
			return getCookie("browserCookie");
        }
}
function checkAndGetDeviceId()
{
  if(localStorage.deviceIdentityNo == undefined || localStorage.deviceIdentityNo == "" || localStorage.deviceIdentityNo == null)
  {
      localStorage.deviceIdentityNo = CreateBrowserCoockie();
  }
  return localStorage.deviceIdentityNo;
}

function CreateBrowserCoockie()
{
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	var string_length = 15;
	var randomstring = '';
	for (var i = 0; i < string_length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum, rnum + 1);
	}
	return randomstring
}
function updateSessionInDB()
{
  //  var userType =  sessionStorage.UserType == "GuestUser" ? 1 : 0;
  var BrowserCookie = checkAndGetBrowserCookie();
	if(BrowserCookie == "")
	{
		BrowserCookie = checkAndGetDeviceId();
	}
    var RequestObj = 
	{
					  "EmailID": sessionStorage.Email,
					  "UserName": "guest",
					  "Password": "guest",
					  "Latitude": 0,
					  "Longitude": 0,
					  "AppType": 3,
					  "deviceUUID": "",
					  "DeviceOS": getDeviceName(),
					  "BrowserType": getBrowserName_session(),
					  "SessionID": sessionStorage.sessionId,
					  "CustomerId": 0,
					  "IsGuest": 1,
					  "TimeOffset": new Date().getTimezoneOffset(),
					  "DeviceCookie":BrowserCookie
                    }
					
	var jsonText = JSON.stringify(RequestObj);	
	console.log(jsonText);	
	url=getServiceURL()+"CreateCustomerSession?value="+ new Date().getTime();
    var xhr = createCORSRequest('POST', url);
  	if (!xhr) {
  	  alert('CORS not supported');
  	}	
	
	xhr.onload = function () {
	
	}
	
	xhr.onerror = function() {
  		alert('!Woops, there was an error making the request.');	   		
  	  };
	  
  	try
	{
	  xhr.setRequestHeader('Content-Type', 'application/json');
    }
    catch(e)
    {
	   console.log("Exception :"+e);
	}	
	xhr.send(jsonText);	  
					
}
function getDeviceName()
{
  if(navigator.platform.indexOf('Mac') > -1)
   return "Mac";
  if(navigator.platform.indexOf('Win') > -1)
   return "Windows";
  if((/iphone/gi).test(navigator.appVersion))
   return "iOS"; 
   if((/ipad/gi).test(navigator.appVersion))
   return "iOS";
  if((/android/gi).test(navigator.appVersion))
   return "Android"; 
   return "other";   
}

function getBrowserName_session() { 
	var nua = navigator.userAgent;
		//alert(nua);
		var isIE = /*@cc_on!@*/false || !!document.documentMode;
		// Edge 20+
		var isEdge = !isIE && !!window.StyleMedia;
		if(isEdge)
		{
			return("Edge");
		}
		else if((nua.indexOf("Opera") || nua.indexOf('OPR')) != -1 ) 
		{
			return('Opera');
		}
		else if(nua.indexOf("Chrome") != -1 )
		{
			return('Chrome');
		}
		else if(nua.indexOf("Safari") != -1)
		{
			return('Safari');
		}
		else if(nua.indexOf("Firefox") != -1 ) 
		{
			 return('Firefox');
		}
		else if((nua.indexOf("MSIE") != -1 ) || (!!document.documentMode == true )) //IF IE > 10
		{
		    return('IE'); 
		}  
		else 
		{
		    return('other');
		}
    }


function isMobileDevice()
{
    if (isMobile())
    {
        /*
        var width = screen.width;
        var height = screen.height;
        width = Math.min(width, height);
        if (width < 768)
        {
            return true;
        }
        */
        return true;
    }
    return false;
}

function isLandscapeMode()
{
    var width = window.innerWidth;
    var height = window.innerHeight;
    if (width > height) {
        return true;
    }
    return false;
}

function isMobile() {
    if (navigator.userAgent.match(/Android/i)
    || navigator.userAgent.match(/webOS/i)
    || navigator.userAgent.match(/iPhone/i)
    || navigator.userAgent.match(/iPad/i)
    || navigator.userAgent.match(/iPod/i)
    || navigator.userAgent.match(/BlackBerry/i)
    || navigator.userAgent.match(/Windows Phone/i)
    ) {
        return true;
    }
    else {
        return false;
    }
}

var currentScreen = -1;
var screenCodes = {
    INSTRUCTIONS: 0,
    LIVE_FEED: 1,
    NO_CAMERA: 2,
    PREVIEW: 3,
    RESULTS:4
};


function getBrowserName() {
    var objappVersion = navigator.appVersion; var objAgent = navigator.userAgent; var objbrowserName = navigator.appName; var objfullVersion = '' + parseFloat(navigator.appVersion); var objBrMajorVersion = parseInt(navigator.appVersion, 10); var objOffsetName, objOffsetVersion, ix;

    if ((objOffsetVersion = objAgent.indexOf("Chrome")) != -1) {
        objbrowserName = "Chrome";
    }
    else if ((objOffsetVersion = objAgent.indexOf("MSIE")) != -1) {
        objbrowserName = "IE";
    }
    else if (navigator.userAgent.match(".NET")) {
        objbrowserName = "IE";
    }
    else if ((objOffsetVersion = objAgent.indexOf("Firefox")) != -1) {
        objbrowserName = "Firefox";
    }
    else if ((objOffsetVersion = objAgent.indexOf("Safari")) != -1) {
        objbrowserName = "Safari";
    }
    else if ((objOffsetName = objAgent.lastIndexOf(' ') + 1) < (objOffsetVersion = objAgent.lastIndexOf('/'))) {
        objbrowserName = objAgent.substring(objOffsetName, objOffsetVersion);
        if (objbrowserName.toLowerCase() == objbrowserName.toUpperCase()) {
            objbrowserName = navigator.appName;
        }
    }

    return objbrowserName;
}

function getLocation() {
    navigator.geolocation.getCurrentPosition(onSuccessLocation, onErrorLocation);
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