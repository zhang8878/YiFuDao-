const lx = init('detail.js');
const ID = 'applyRecordId';
const id = lx.r(ID);



Quantumult X配置参考，其他软件类似[重写]脚本：deal.js类型：script-response-body网址：https://yfd.ly-sky.com/ly-ms/application/api/oa/detail/*[Mitm]主机名：yfd.ly-sky.com****************/如果（！lx.isResponse()) {lx.log('$response不存在，启动方式错误，应以rewrite和mitm方式启动');lx.done();}let body = lx.toObj($response.body);let dt = body.data.askForLeaveDetail || body.data.goOutDetail;如果（！dt）{lx.done();}如果（dt.applyRecordId！== id) {lx.done();}const timenow = new Date().setMinutes(0, 0);let applyDate = new Date();let approveDate = new Date();let a = Math.floor(Math.random() * (19 - 7 + 1) + 7);设i = a + 2;let b = Math.floor(Math.random() * (22 - i + 1) + i);applyDate.setDate(applyDate.getDate() - 1);approveDate.setDate(approveDate.getDate() - 1);applyDate.setHours(a, Math.floor(Math.random() * 60), 0, 0);approveDate.setHours(b, Math.floor(Math.random() * 60), 0, 0);Date.prototype.format=function(fmt){var o={'M+':this.getMonth()+1,'d+':this.getDate(),'h+':this.getHours(),'m+':this.getMinutes(),'s+':this.getSeconds(),'q+':Math.floor((this.getMonth()+3)/3),S:this.getMilliseconds()};if(/(y+)/.test(fmt)){fmt=fmt.replace(RegExp.$1,(this.getFullYear()+''').substr(4-RegExp.$1.length));}for(var k in o){if(new RegExp('('+k+')').test(fmt)){fmt=fmt.replace(RegExp.1美元，RegExp。$1.length==1？o[k]:('00'+o[k]).substr((''+o[k]).length));}}return fmt;};//dt.applyProxy = true;dt.applyStatus = 4;//dt.parentsKnow = true;dt.beginTime = timenow - 3600000;dt.endTime = timenow + 7200000;//dt.alias = "事假";//dt.leaveSchool = true;//dt.location = "";//dt.reason = "";// dt.chains[0].applicant = true;// dt.chains[0].userName = "";// dt.chains[0].avatar = "";// dt.chains[0].status = -99;dt.chains[0].time = applyDate.format('yyyy-MM-dd hh:mm');// dt.chains[0].message = "";// dt.chains[0].className = "";// dt.chains[0].blzzr = true;// dt.chains[1].applicant = true;// dt.chains[1].userName = "";// dt.chains[1].avatar = "";dt.chains[1].status = 3;dt.chains[1].time = approveDate.format('yyyy-MM-dd hh:mm');// dt.chains[1].message = "";// dt.chains[1].className = null;// dt.chains[1].blzzr = true;if (dt.chains.length === 3) {dt.chains.splice（2，1）；}function init(name){const startTime=new Date().getTime();const isRequest=function(){return'undefined'!==typeof $request;};const isResponse=function(){return'undefined'!==typeof $response;};const isPost=function(){return'POST'===$request.method;};const isGet=function(){return'GET'===$request.method;};const isNode=function(){return'undefined'!==typeof module&&!!module.exports;};const isQuanX=function(){return'undefined'!==typeof $task;};const isSurge=function(){return'undefined'!==typeof $httpClient&&'undefined'===typeof $loon;};const isLoon=function(){return'undefined'!==typeof $loon;};const toObj=function(str,defaultValue=null){try{return JSON.parse(str);}catch{return defaultValue;}};const toStr=function(obj,defaultValue=null){try{return JSON.stringify(obj);}catch{return defaultValue;}};const msg=function(title,subtitle=''',desc='){if(isQuanX()){$notify(title,subtitle,desc);}else if(isSurge()||isLoon()){$notification.post(title,subtitle,desc);}};const log=function(...logs){if(logs.length>0){logs=err&&res){res.body=body;res.statusCode=res.status;}callback(err,res,body);});}else if(isQuanX()){opts.method='GET';await $task.fetch(opts).then(function(res){const{statusCode:statusCode,headers,body}=res;callback(null,{status,status,statusCode,headers,body},body);},function(err){callback(err);});}};const post=async function(opts,callback=function(){}){if(isSurge()||isLoon()){await $httpClient.post(opts,function(err,reerr&&&res){res.body=body;res.statusCode=res.status;}callback(err,res,body);});}else if(isQuanX()){opts.method='POST';await $task.fetch(opts).then(function(res){const{statusCode:statusCode,headers,body}=res;callback(null,{status,statusCode,headers,body},body);},function(err){callback(err);});}};const r=function(key){if(isQuanX()){return $prefs.valueForKey(key);}else if(isSurge()||isLoon()){return $persistentStorelx.done({ body: lx.toStr(body) });
