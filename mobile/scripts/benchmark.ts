import {performance} from 'node:perf_hooks';
import {transition,visualFixture} from '../src/game/engine';
const now=1700000000000;let state=visualFixture(now);const samples:number[]=[];
for(let i=0;i<11000;i++){const start=performance.now();state=transition(state,{type:'move',from:i%2?53:0,to:i%2?0:53},now,()=>false).state;const time=performance.now()-start;if(i>=1000)samples.push(time)}
samples.sort((a,b)=>a-b);console.log(JSON.stringify({environment:'desktop Node; pure domain transitions only',samples:samples.length,p50_ms:samples[Math.floor(samples.length*.5)],p95_ms:samples[Math.floor(samples.length*.95)],max_ms:samples.at(-1),device_fps_measured:false},null,2));
