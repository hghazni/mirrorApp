(function(a){a.defaultValue=function(a,b){return"undefined"!==typeof a?a:b};a.Point=function(c,b){this.x=a.defaultValue(c,0);this.y=a.defaultValue(b,0)};a.Point.prototype.setTo=function(c,b){this.x=a.defaultValue(c,0);this.y=a.defaultValue(b,0)};a.Rectangle=function(c,b,d,e){this.x=a.defaultValue(c,0);this.y=a.defaultValue(b,0);this.width=a.defaultValue(d,0);this.height=a.defaultValue(e,0)};a.Rectangle.prototype.setTo=function(c,b,d,e){this.x=a.defaultValue(c,0);this.y=a.defaultValue(b,0);this.width=
a.defaultValue(d,0);this.height=a.defaultValue(e,0)};a.BTBPMode={FACE_DETECTION:"mode_face_detection",FACE_TRACKING:"mode_face_tracking",POINT_TRACKING:"mode_point_tracking"};a.BTBPState={FACE_DETECTION:"state_face_detection",FACE_TRACKING_START:"state_face_tracking_start",FACE_TRACKING:"state_face_tracking",RESET:"state_reset"};a.BRFFace=function(){this.nextState=this.state=this.lastState=a.BTBPState.RESET;this.vertices=[];this.triangles=[];this.points=[];this.bounds=new a.Rectangle(0,0,0,0);this.refRect=
new a.Rectangle(0,0,0,0);this.candideVertices=[];this.candideTriangles=[];this.scale=1;this.rotationZ=this.rotationY=this.rotationX=this.translationY=this.translationX=0}})(btbpv4);
