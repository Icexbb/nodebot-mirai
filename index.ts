// import WebSocket from 'ws';
//
// const qq= "3309659104"
// const verifyKey = "INITKEYUxz9y3jt"
// const ws =new WebSocket(`ws://192.168.6.244:8999/all?qq=${qq}&verifyKey=${verifyKey}`)
//
// ws.onopen=function (ev){
//     console.log(typeof ev)
//     console.log(`ws Connection open at ${ws.url}`)
// }
// ws.onmessage=function(ev){
//     console.log(typeof ev)
//     console.log(`receive ${ev.data}`)
// }
// ws.onclose=function (ev){
//     console.log(typeof ev)
//     console.log(`ws Connection close`)
// }
// ws.onerror=function (ev){
//     console.log(typeof ev)
//     console.log(`ws Connection error`)
// }

import * as Segments from "./src/message/segment.js";
console.log(Segments)