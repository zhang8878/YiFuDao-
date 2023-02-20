*******************
【Quantumult X配置】

[rewrite_local]
#重写规则，点击健康打卡时，自动获取accessToken和User-Agent
https://yfd.ly-sky.com/ly-pd-mb/form/api/healthCheckIn/client/student/indexVo url script-request-header yfd_checkin.js

[mitm]
hostname = yfd.ly-sky.com

#task_local规则，每天定时自动执行脚本
[task_local]
5 0 * * * yfd_checkin.js, tag=奕辅导, enabled=true

******************/

//###########   Config  ####################

const clear_data = false; //当为true时，清除已保存的打卡数据，重新获取。默认值应为false
const retryNum = 3;//getInfo重试次数

//###########   手动设置数据并持久化，如无需要请勿改动。(方便调试,或无rewrite和mitm)
const user_token = ''; //accessToken
const user_UA = ''; //User-Agent
const user_data = ''; //完整的打卡数据body，以字符串方式传入。
//###########

//以下全局变量，不要改动。除非你知道你在做什么
const lx = init('奕辅导健康上报');
const token = 'yfd_accessToken';
const UA = 'yfd_User-Agent';
const data = 'yfd_checkin_data';
var retry = retryNum;
var id = null; //questionnairePublishEntityId
var title = 'title';
var hadFill = 'hadFill';
var description = 'description';
var header = {};

async function getInfo() {
    //获取打卡的信息，id每天不一样
    retry -= 1;
    let url = {
        url: 'https://yfd.ly-sky.com/ly-pd-mb/form/api/healthCheckIn/client/student/indexVo',
        headers: header,
    };
    await lx.get(url, function (err, response, body) {
        let res = JSON.parse(body);
        if (res.code === 200) {
            id = res.data.questionnairePublishEntityId;
            title = res.data.title;
            hadFill = res.data.hadFill;
            description = res.data.description;
        }
        lx.log('getInfo(), code:' + res.code + ', message:' + res.message + ', retry:' + retry);
    });
}
/* function getDistance(lat1, lng1, lat2, lng2) {
    console.log(lat1, lng1, lat2, lng2);
    var radLat1 = lat1 * Math.PI / 180.0;
    var radLat2 = lat2 * Math.PI / 180.0;
    var a = radLat1 - radLat2;
    var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378.137;
    s = Math.round(s * 10000) / 10000;
    return s;  // 单位千米
} */
async function locFilter(dt) {
    var loc;
    let list = dt.answerInfoList;
    for (var l of list) {
        if ('location' in l) {
            loc = l.location;
            break;
        }
    }
    if (loc) {
        lx.log(`${loc.province},${loc.city},${loc.area},${loc.street},${loc.address}\n经度${loc.longitude}纬度${loc.latitude}\n距离${loc.deviationDistance}\n`);
    }
    return loc;
}
async function checkIn() {
    //打卡主体
    let dt = JSON.parse(lx.r(data));
    dt['questionnairePublishEntityId'] = id; //id
    await locFilter(dt);
    dt = JSON.stringify(dt);
    let url = {
        url: 'https://yfd.ly-sky.com/ly-pd-mb/form/api/answerSheet/saveNormal',
        headers: header,
        body: dt,
    };
    await lx.post(url, function (err, response, body) {
        let res = JSON.parse(body);
        if (res.code === 200) {
            lx.log('checkIn(),' + title + ',打卡成功,code:' + res.code + ',message:' + res.message);
            lx.msg(title, '打卡成功', res.code + ':' + res.message);
        } else {
            lx.log('checkIn(),' + title + ',打卡失败,code:' + res.code + ',message:' + res.message);
            lx.msg(title, '打卡失败', res.code + ':' + res.message);
        }
    });
}
async function main() {
    lx.log('main()');
    if (clear_data) {
        lx.w('', data);
        lx.log('打卡数据已清除');
    }
    if (user_token) {lx.w(user_token, token);}
    if (user_UA) {lx.w(user_UA, UA);}
    if (user_data) {lx.w(user_data, data);}
    header = {
        Host: 'yfd.ly-sky.com',
        Connection: 'keep-alive',
        accessToken: lx.r(token),
        userAuthType: 'MS',
        'Accept-Encoding': 'gzip,compress,br,deflate',
        'User-Agent': lx.r(UA),
        'content-type': 'application/json',
        Referer: 'https://servicewechat.com/wx217628c7eb8ec43c/20/page-frame.html',
    };
    while (id === null && retry > 0) {
        await getInfo(); //获取打卡id和打卡状态
    }
    lx.log(`id: ${id}\nhadFill: ${hadFill}\ntitle: ${title}\ndescription: ${description}\n`);
    if (lx.r(data)) {
        lx.log('打卡数据已存在');
        if (hadFill) {
            lx.log(title + ' 今天已打卡');
            lx.msg(title, '', '今天已打卡');
        } else {
            await checkIn(); //执行打卡
        }
    } else {
        lx.log('打卡数据不存在');
        if (hadFill) {
            lx.log('开始获取打卡数据');
            await getAnswer();
        } else {
            lx.log('今天未打卡，无法获取打卡数据。请在小程序中手动打卡');
            lx.msg('今天未打卡，无法获取打卡数据。', '', '请在小程序中手动打卡');
        }
    }
    lx.done();
}
function getToken() {
    //获取accessToken和User-Agent，并持久化
    if ($request.headers) {
        const t = $request.headers['accessToken'];
        const ua = $request.headers['User-Agent'];
        lx.w(t, token);
        lx.w(ua, UA);
        lx.msg('获取token, UA', 'token: ' + t, 'UA: ' + ua);
        lx.log('token: ' + t + '\nUA: ' + ua);
        lx.done();
    }
}
/* function getSaveNormal() {
    //抓包手动打卡的数据，并持久化
    if ($request.body) {
        const dt = $request.body;
        lx.w(dt, data);
        lx.msg('获取data成功', '', dt);
        lx.log('获取data成功' + dt);
        lx.done();
    }
} */
async function getAnswer() {
    //获取已打卡的数据，并持久化
    lx.log('getAnswer()');
    let url = {
        url: 'https://yfd.ly-sky.com/ly-pd-mb/form/api/questionnairePublish/' + id + '/getDetailWithAnswer',
        headers: header,
    };
    url.headers['content-type'] = 'application/x-www-form-urlencoded';
    url.headers['Referer'] = 'https://servicewechat.com/wx217628c7eb8ec43c/29/page-frame.html';
    await lx.get(url, function (err, response, body) {
        let res = JSON.parse(body);
        if (res.code === 200) {
            res = res['data']['answerInfoList'];
            var answerInfoList = new Array();
            for (var x in res) {
                var obj = {};
                var subjectType = res[x]['subjectType'];
                obj['subjectId'] = res[x]['subjectId'];
                obj['subjectType'] = subjectType;
                obj[subjectType] = res[x][subjectType];
                answerInfoList.push(obj);
                //lx.log(JSON.stringify(obj));
            }
            if (answerInfoList.length === 0) {
                lx.msg('获取打卡数据data失败', '获取到' + answerInfoList.length + '个问题,请手动打卡后重试。', dt);
                lx.log('获取打卡数据data失败，获取到' + answerInfoList.length + '个问题,请手动打卡后重试。' + dt);
            } else {
                var dt = {
                    questionnairePublishEntityId: id,
                    answerInfoList: answerInfoList,
                };
                dt = JSON.stringify(dt);
                lx.w(dt, data);
                lx.msg('获取打卡数据data成功', '获取到' + answerInfoList.length + '个问题', dt);
                lx.log('获取打卡数据data成功，获取到' + answerInfoList.length + '个问题。' + dt);
            }
        } else {
            lx.log('获取打卡数据data失败，code:' + res.code + ',message:' + res.message);
            lx.msg('获取打卡数据data失败', res.code + ':' + res.message);
        }
    });
}
function start() {
    if (lx.isRequest()) {
        if (lx.isGet()) {
            getToken(); //获取accessToken和User-Agent
        }
        if (lx.isPost()) {
            //getSaveNormal()//获取手动打卡的数据
            lx.done();
        } else {
            lx.done();
        }
    }
    main();
}

function init(name){const startTime=new Date().getTime();const isRequest=function(){return'undefined'!==typeof $request;};const isResponse=function(){return'undefined'!==typeof $response;};const isPost=function(){return'POST'===$request.method;};const isGet=function(){return'GET'===$request.method;};const isNode=function(){return'undefined'!==typeof module&&!!module.exports;};const isQuanX=function(){return'undefined'!==typeof $task;};const isSurge=function(){return'undefined'!==typeof $httpClient&&'undefined'===typeof $loon;};const isLoon=function(){return'undefined'!==typeof $loon;};const toObj=function(str,defaultValue=null){try{return JSON.parse(str);}catch{return defaultValue;}};const toStr=function(obj,defaultValue=null){try{return JSON.stringify(obj);}catch{return defaultValue;}};const msg=function(title,subtitle='',desc=''){if(isQuanX()){$notify(title,subtitle,desc);}else if(isSurge()||isLoon()){$notification.post(title,subtitle,desc);}};const log=function(...logs){if(logs.length>0){logs=[...logs];}console.log(logs.join('\n'));};const get=async function(opts,callback){if(isSurge()||isLoon()){await $httpClient.get(opts,function(err,res,body){if(!err&&res){res.body=body;res.statusCode=res.status;}callback(err,res,body);});}else if(isQuanX()){opts.method='GET';await $task.fetch(opts).then(function(res){const{statusCode:status,statusCode,headers,body}=res;callback(null,{status,statusCode,headers,body},body);},function(err){callback(err);});}};const post=async function(opts,callback=function(){}){if(isSurge()||isLoon()){await $httpClient.post(opts,function(err,res,body){if(!err&&res){res.body=body;res.statusCode=res.status;}callback(err,res,body);});}else if(isQuanX()){opts.method='POST';await $task.fetch(opts).then(function(res){const{statusCode:status,statusCode,headers,body}=res;callback(null,{status,statusCode,headers,body},body);},function(err){callback(err);});}};const r=function(key){if(isQuanX()){return $prefs.valueForKey(key);}else if(isSurge()||isLoon()){return $persistentStore.read(key);}};const w=function(val,key){if(isQuanX()){return $prefs.setValueForKey(val,key);}else if(isSurge()||isLoon()){return $persistentStore.write(val,key);}};const wait=function(time){return new Promise(function(resolve){setTimeout(resolve,time);});};const done=function(val={}){const endTime=new Date().getTime();const costTime=(endTime-startTime)/1000;log(name+' 结束运行，耗时：'+costTime);if(isQuanX()||isSurge()||isLoon()){$done(val);}};return{msg,log,get,post,done,r,w,wait,toObj,toStr,isLoon,isNode,isQuanX,isSurge,isRequest,isResponse,isPost,isGet,};}

start();
