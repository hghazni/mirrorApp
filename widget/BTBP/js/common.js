var flag=0,count=1,_analytics=!0,isServiceFail,dataEncodingHeader="data:image/jpeg;base64,";
function CustomAlert(){var a;this.show=function(b,c,d){a=c;log(b);c=document.createElement("div");c.innerHTML='<div class="alertBox"><div>\x3c!--<img class="custom_alert_close" onclick="customAlert.hide();" src="img/desktop/Desktop_CheckCircle_normal.png"/><br/>--\x3e<div id="alertMsg">msg here</div><br/><div id="CA_ok_label" class="btn_black" onclick="customAlert.hide();">ok</div></div></div>';c.setAttribute("class","mask");c.id="customAlert";document.getElementById("btbp-container").appendChild(c);
getElement("alertMsg").innerHTML=b;getElement("CA_ok_label").innerHTML=void 0==d?"OK":d;getElement("customAlert").style.display="table";disableScrolling()};this.hide=function(){var b=getElement("customAlert");document.getElementById("btbp-container").removeChild(b);skipAnalysis=!1;enableScrolling();try{a()}catch(c){console.log(c)}}}var customAlert=new CustomAlert;
function CustomConfirm(){var a,b;this.show=function(c,d,e){a=d;b=e;log(c);d=document.createElement("div");d.innerHTML='<div class="alertBox"><div><div id="alertMsg">msg here</div><br/><div id="CA_ok_label" class="btn_black" onclick="customConfirm.ok();">ok</div><div id="CA_cancel_label" class="btn_black" onclick="customConfirm.cancel();" style="margin-left:15px;">cancel</div></div></div>';d.setAttribute("class","mask");d.id="customAlert";document.getElementById("btbp-container").appendChild(d);getElement("alertMsg").innerHTML=
c;getElement("CA_ok_label").innerHTML="OK";getElement("CA_cancel_label").innerHTML="Cancel";getElement("customAlert").style.display="table";disableScrolling()};this.ok=function(){var b=getElement("customAlert");document.getElementById("btbp-container").removeChild(b);enableScrolling();try{a()}catch(d){}};this.cancel=function(){var a=getElement("customAlert");document.getElementById("btbp-container").removeChild(a);enableScrolling();try{b()}catch(d){}}}var customConfirm=new CustomConfirm;
function enableScrolling(){document.body.removeAttribute("class","stop_scrolling")}function disableScrolling(){document.body.setAttribute("class","stop_scrolling")}function CreateSessionId(){for(var a="",b=0;15>b;b++)var c=Math.floor(61*Math.random()),a=a+"0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz".substring(c,c+1);sessionStorage.sessionId=a}
function checkAndGetCookie(){var a=getCookie("userEmailIDS");if(""!=a)return a;a=createEmailId_N();setCookie("userEmailIDS",a,365);return a}function setCookie(a,b,c){var d=new Date;d.setTime(d.getTime()+864E5*c);c="expires="+d.toUTCString();document.cookie=a+"="+b+"; "+c+";path=/"}function getCookie(a){a+="=";for(var b=document.cookie.split(";"),c=0;c<b.length;c++){for(var d=b[c];" "==d.charAt(0);)d=d.substring(1);if(0==d.indexOf(a))return d.substring(a.length,d.length)}return""}
function createEmailId_N(){for(var a="",b=0;15>b;b++)var c=Math.floor(61*Math.random()),a=a+"0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz".substring(c,c+1);return a+"@btbp.org"}function CreateEmailId(){try{var a=checkAndGetCookie();setSessionData("Email",a)}catch(b){console.log(b)}}
function httpClient(){this.Post=function(a,b,c,d){try{var e=new XMLHttpRequest;e.open("POST",a,!0);e.onreadystatechange=function(){200==e.status&&4==e.readyState&&c(e.responseText);400!=e.status&&404!=e.status||d()};e.onerror=function(){d()};e.setRequestHeader("Content-Type","application/json");e.send(b)}catch(f){log(f)}};this.Get=function(a,b,c){try{var d=new XMLHttpRequest;d.open("GET",a,!0);d.onreadystatechange=function(){200==d.status&&4==d.readyState&&b(d.responseText);400==d.status&&c()};d.onerror=
function(){c()};d.send()}catch(e){log(e)}}}var HttpClient=new httpClient;function getServiceURL(){return"https://api.btbp.org/deeptag/Appservice.svc/"}function log(a){console.log(a)}function setCookieData(a,b){if(isStorage()&&isCookiesEnabled())try{var c=new Date;c.setTime(c.getTime()+63072E7);var d="expires="+c.toUTCString();document.cookie=a+"="+b+";"+d+";path=/"}catch(e){console.log(e)}else console.log("cookiesStorageError")}
function getCookieData(a){if(isStorage()&&isCookiesEnabled())try{a+="=";for(var b=document.cookie.split(";");0<b.length;){for(var c=b[0];" "==c.charAt(0);)c=c.substring(1);return 0==c.indexOf(a)?c.substring(a.length,c.length):!1}return""}catch(d){console.log(d)}else console.log("cookiesStorageError")}function setSessionData(a,b){if(isStorage()&&isCookiesEnabled())try{sessionStorage.setItem(a,b)}catch(c){console.log(c)}else customAlert1.show("cookiesStorageError")}
function getSessionData(a){if(isStorage()&&isCookiesEnabled())try{return sessionStorage.getItem(a)}catch(b){console.log(b)}else console.log("cookiesStorageError");return""}function removeSessionData(a){if(isStorage()&&isCookiesEnabled())try{return sessionStorage.removeItem(a)}catch(b){console.log(b)}else console.log("cookiesStorageError")}function isCookiesEnabled(){return navigator.cookieEnabled?!0:!1}
function isStorage(){if("undefined"!=typeof Storage){try{sessionStorage.test="test",console.log("test storage"+sessionStorage)}catch(a){return!1}return!0}return!1}function setDisplay(a,b){document.getElementById(a).style.display=b}var AnalyticsInfo=[];
function ScreenTracking(a,b){try{if(void 0==sessionStorage.CurrentScreenName||""==sessionStorage.CurrentScreenName){sessionStorage.CurrentScreenName=a;sessionStorage.StartTime=(new Date).getTime();sessionStorage.comment=b;var c=(new Date).getTime()-sessionStorage.StartTime;AnalyticsInfo.push({ScreenCode:sessionStorage.CurrentScreenName,TimeSpent:(c/1E3).toFixed(1),comments:sessionStorage.comment})}else void 0==sessionStorage.comment&&(comment=0),c=(new Date).getTime()-sessionStorage.StartTime,AnalyticsInfo.push({ScreenCode:sessionStorage.CurrentScreenName,
TimeSpent:(c/1E3).toFixed(1),comments:sessionStorage.comment}),sessionStorage.CurrentScreenName=a,sessionStorage.comment=b,sessionStorage.StartTime=(new Date).getTime()}catch(d){}setTimeout(function(){},120)}function validateStorageOnLoad(){isStorage()&&isCookiesEnabled()||customAlert1.show("please enable session storage and cookies")}
function getSessionData(a){if(isStorage()&&isCookiesEnabled())try{return sessionStorage.getItem(a)}catch(b){console.log(b)}else console.log("cookiesStorageError");return""}function removeSessionData(a){if(isStorage()&&isCookiesEnabled())try{return sessionStorage.removeItem(a)}catch(b){console.log(b)}else console.log("cookiesStorageError")}
function storeAnalytics(){if(0!=AnalyticsInfo.length){url=getServiceURL()+"SaveAnalyticsInfo?value="+(new Date).getTime();var a=JSON.stringify({AnalyticsDetails:AnalyticsInfo,EmailID:sessionStorage.Email,SesionID:sessionStorage.sessionId}),b=function(a){},c=function(){};_analytics&&(log(a),setTimeout(function(){HttpClient.Post(url,a,b,c)},500),AnalyticsInfo=[])}}function getElement(a){return document.getElementById(a)}
function checkAndGetBrowserCookie(){var a=getCookie("browserCookie");if(""!=a)return a;setCookie("browserCookie",CreateBrowserCoockie(),365);return getCookie("browserCookie")}function checkAndGetDeviceId(){if(void 0==localStorage.deviceIdentityNo||""==localStorage.deviceIdentityNo||null==localStorage.deviceIdentityNo)localStorage.deviceIdentityNo=CreateBrowserCoockie();return localStorage.deviceIdentityNo}
function CreateBrowserCoockie(){for(var a="",b=0;15>b;b++)var c=Math.floor(61*Math.random()),a=a+"0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz".substring(c,c+1);return a}
function updateSessionInDB(){var a=checkAndGetBrowserCookie();""==a&&(a=checkAndGetDeviceId());a={EmailID:sessionStorage.Email,UserName:"guest",Password:"guest",Latitude:0,Longitude:0,AppType:3,deviceUUID:"",DeviceOS:getDeviceName(),BrowserType:getBrowserName_session(),SessionID:sessionStorage.sessionId,CustomerId:0,IsGuest:1,TimeOffset:(new Date).getTimezoneOffset(),DeviceCookie:a};a=JSON.stringify(a);console.log(a);url=getServiceURL()+"CreateCustomerSession?value="+(new Date).getTime();var b=createCORSRequest("POST",
url);b||alert("CORS not supported");b.onload=function(){};b.onerror=function(){alert("!Woops, there was an error making the request.")};try{b.setRequestHeader("Content-Type","application/json")}catch(c){console.log("Exception :"+c)}b.send(a)}
function getDeviceName(){return-1<navigator.platform.indexOf("Mac")?"Mac":-1<navigator.platform.indexOf("Win")?"Windows":/iphone/gi.test(navigator.appVersion)||/ipad/gi.test(navigator.appVersion)?"iOS":/android/gi.test(navigator.appVersion)?"Android":"other"}
function getBrowserName_session(){var a=navigator.userAgent;return!document.documentMode&&window.StyleMedia?"Edge":-1!=(a.indexOf("Opera")||a.indexOf("OPR"))?"Opera":-1!=a.indexOf("Chrome")?"Chrome":-1!=a.indexOf("Safari")?"Safari":-1!=a.indexOf("Firefox")?"Firefox":-1!=a.indexOf("MSIE")||1==!!document.documentMode?"IE":"other"}function isMobileDevice(){return isMobile()?!0:!1}function isLandscapeMode(){return window.innerWidth>window.innerHeight?!0:!1}
function isMobile(){return navigator.userAgent.match(/Android/i)||navigator.userAgent.match(/webOS/i)||navigator.userAgent.match(/iPhone/i)||navigator.userAgent.match(/iPad/i)||navigator.userAgent.match(/iPod/i)||navigator.userAgent.match(/BlackBerry/i)||navigator.userAgent.match(/Windows Phone/i)?!0:!1}var currentScreen=-1,screenCodes={INSTRUCTIONS:0,LIVE_FEED:1,NO_CAMERA:2,PREVIEW:3,RESULTS:4};
function getBrowserName(){var a=navigator.userAgent,b=navigator.appName;parseFloat(navigator.appVersion);parseInt(navigator.appVersion,10);var c,d;-1!=a.indexOf("Chrome")?b="Chrome":-1!=a.indexOf("MSIE")?b="IE":navigator.userAgent.match(".NET")?b="IE":-1!=a.indexOf("Firefox")?b="Firefox":-1!=a.indexOf("Safari")?b="Safari":(c=a.lastIndexOf(" ")+1)<(d=a.lastIndexOf("/"))&&(b=a.substring(c,d),b.toLowerCase()==b.toUpperCase()&&(b=navigator.appName));return b}
function getLocation(){navigator.geolocation.getCurrentPosition(onSuccessLocation,onErrorLocation)}function createCORSRequest(a,b){var c=new XMLHttpRequest;"withCredentials"in c?c.open(a,b,!0):"undefined"!=typeof XDomainRequest?(c=new XDomainRequest,c.open(a,b)):c=null;return c};
