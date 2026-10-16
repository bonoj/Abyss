
import * as T from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {createEdgeDetection} from '../arcana/edge-detection.js';

// Build metadata is stamped by the Pages workflow from the deployed commit.
// Never display the inherited JIT source revision as the current build.
let BUILD='unverified';
try {
 const response=await fetch(new URL('../build.json',import.meta.url),{cache:'no-store'});
 if(!response.ok)throw Error('Build metadata HTTP '+response.status);
 const info=await response.json();
 if(!/^[0-9a-f]{40}$/.test(info.sha))throw Error('Invalid deployment SHA');
 BUILD=info.sha;
} catch(error){console.warn('Hermeticon build identity unavailable',error)}
document.querySelector('#build').textContent=BUILD==='unverified'?'--------':BUILD.slice(0,8);
// Refresh navigates to a new URL, bypassing cached HTML as well as modules.
// A plain reload can reuse the same cached entry and its old import graph.
const githubToggle=document.querySelector('#githubToggle'),githubPanel=document.querySelector('#githubPanel');
if(githubToggle&&githubPanel){
 githubToggle.addEventListener('click',()=>{
  const opening=githubPanel.hidden;
  githubPanel.hidden=!opening;
  githubToggle.setAttribute('aria-expanded',String(opening));
 });
 document.addEventListener('pointerdown',event=>{
  if(!githubPanel.hidden&&!githubPanel.contains(event.target)&&!githubToggle.contains(event.target)){
   githubPanel.hidden=true;githubToggle.setAttribute('aria-expanded','false');
  }
 });
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!githubPanel.hidden){githubPanel.hidden=true;githubToggle.setAttribute('aria-expanded','false');githubToggle.focus()}});
}
document.querySelector('#fresh').onclick=()=>{
 const url=new URL(location.href);
 url.searchParams.set('fresh',Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));
 location.replace(url.href);
};



try {
const scene=new T.Scene();scene.background=new T.Color(0x06101b);scene.fog=new T.FogExp2(0x071827,.012);
const world=new T.Group();scene.add(world);
// A world supplies its reality; Athanor supplies mounting, scheduling and observation.
// Parentage, visibility and update participation are deliberately independent.
const mounts=new Map();
document.querySelector('#meteor')?.addEventListener('click',()=>{for(const entry of mounts.values())if(entry.active&&typeof entry.source.castMeteor==='function')entry.source.castMeteor()});
function mountWorld(id,source,{parent=null,visible=true,active=true}={}){
 if(typeof id!=='string'||!id||mounts.has(id))throw Error('Invalid or duplicate world id: '+id);
 if(parent!==null&&!mounts.has(parent))throw Error('Unknown parent world: '+parent);
 if(!source||!(source.group instanceof T.Object3D))throw Error('World requires a THREE.Object3D group');
 if(source.group.parent)throw Error('World group is already attached');
 const host=parent===null?world:mounts.get(parent).source.group;
 if(source.group===host||source.group===world)throw Error('Invalid world group');
 host.add(source.group);source.group.visible=visible;
 const entry={id,parent,source,active,visible,error:null};
 mounts.set(id,entry);
 if(typeof source.observationTargets==='function')edgeDetection?.observeTerrain(source.observationTargets().terrain);
 return id;
}
function unmountWorld(id){
 const entry=mounts.get(id);if(!entry)return false;
 for(const child of [...mounts.values()])if(child.parent===id)unmountWorld(child.id);
 entry.source.group.removeFromParent();mounts.delete(id);return true;
}
function setWorldState(id,{active,visible}={}){
 const entry=mounts.get(id);if(!entry)throw Error('Unknown world: '+id);
 if(active!==undefined)entry.active=!!active;
 if(visible!==undefined){entry.visible=!!visible;entry.source.group.visible=entry.visible}
}
function inspectMount(entry){
 const ancestry=[];let parent=entry.parent;
 while(parent!==null){ancestry.unshift(parent);parent=mounts.get(parent)?.parent??null}
 const report={id:entry.id,parent:entry.parent,ancestry:ancestry,active:entry.active,visible:entry.visible,children:entry.source.group.children.length,error:entry.error};
 if(typeof entry.source.inspect==='function'){
  try{report.world=entry.source.inspect()}catch(error){report.inspectionError=String(error)}
 }
 return report;
}
const Athanor=Object.freeze({mount:mountWorld,unmount:unmountWorld,setState:setWorldState,inspect:()=>inspectWorld(),view:()=>({renderer,camera})});
globalThis.Athanor=Athanor;
// Read-only observation: Athanor.inspect() retains the full report; this is the material-only view.
globalThis.HermeticonSurvey=()=>[...mounts.values()].filter(m=>m.active).map(m=>({id:m.id,material:m.source.materialSurvey?.()??null}));

const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.38;document.querySelector('#stage').append(renderer.domElement);
const camera=new T.PerspectiveCamera(42,1,.1,150);scene.add(new T.HemisphereLight(0x82c6dc,0x17202d,1.5));const sun=new T.DirectionalLight(0xffc77e,2.4);sun.position.set(-7,13,7);scene.add(sun);const blue=new T.PointLight(0x2cbed7,95,36);blue.position.set(2,-2,2);scene.add(blue);
let angle=.6,elev=.52,dist=27,targetY=0,lastX=0,lastY=0;
const pointers=new Map(),pointerStarts=new Map();let pinch=0,multiGesture=false;
const TAP_SLOP=12;
renderer.domElement.addEventListener('pointerdown',e=>{
 if(pointers.size)multiGesture=true;
 pointerStarts.set(e.pointerId,[e.clientX,e.clientY]);
 pointers.set(e.pointerId,[e.clientX,e.clientY]);
 lastX=e.clientX;lastY=e.clientY;
 renderer.domElement.setPointerCapture(e.pointerId);
});
renderer.domElement.addEventListener('pointermove',e=>{
 if(!pointers.has(e.pointerId))return;
 const old=pointers.get(e.pointerId),start=pointerStarts.get(e.pointerId);
 pointers.set(e.pointerId,[e.clientX,e.clientY]);
 const ps=[...pointers.values()];
 if(ps.length===1&&!multiGesture){
  // Do not orbit during a tap; orbit starts only after intentional drag.
  if(Math.hypot(e.clientX-start[0],e.clientY-start[1])>=TAP_SLOP){
   angle+=(e.clientX-old[0])*.006;
   elev=T.MathUtils.clamp(elev+(e.clientY-old[1])*.004,-.4,1.2);
  }
 }else if(ps.length===2){
  const d=Math.hypot(ps[0][0]-ps[1][0],ps[0][1]-ps[1][1]);
  if(pinch)dist=T.MathUtils.clamp(dist*pinch/d,2,100);
  pinch=d;
 }
});
function end(e,canceled=false){
 const start=pointerStarts.get(e.pointerId);
 if(!canceled&&!multiGesture&&start&&pointers.size===1&&Math.hypot(e.clientX-start[0],e.clientY-start[1])<TAP_SLOP)
  {for(const entry of mounts.values())if(entry.active&&typeof entry.source.tap==='function')entry.source.tap(e.clientX,e.clientY)}
 pointerStarts.delete(e.pointerId);pointers.delete(e.pointerId);
 if(!pointers.size){pinch=0;multiGesture=false}
}
renderer.domElement.addEventListener('pointerup',e=>end(e));
renderer.domElement.addEventListener('pointercancel',e=>end(e,true));
renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();dist=T.MathUtils.clamp(dist+e.deltaY*.022,2,100)},{passive:false});
function fitBaubleDistance(){const halfV=T.MathUtils.degToRad(camera.fov)/2;const halfH=Math.atan(Math.tan(halfV)*camera.aspect);return 10.25/Math.sin(Math.min(halfV,halfH))*1.12}let firstFit=true;function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();const fit=fitBaubleDistance();if(firstFit){dist=fit;firstFit=false}else dist=T.MathUtils.clamp(dist,2,100)}addEventListener('resize',resize);resize();


const probeButton=document.querySelector('#probe'),probePanel=document.querySelector('#probePanel'),probeText=document.querySelector('#probeText');
const detailsButton=document.querySelector('#detailsProbe'),copyButton=document.querySelector('#copyProbe');
let probeFrames=0,probeFrameMs=0,probeLast=performance.now(),displayFps=null;
const fpsLabel=document.querySelector('#fps');
function inspectWorld(){
 const report={identity:{build:BUILD,fps:displayFps},mount:{name:mounts.size?'worlds':'empty',children:world.children.length,count:mounts.size,worlds:[...mounts.values()].map(inspectMount)},camera:{azimuth:angle,elevation:elev,distance:dist,targetY,fov:camera.fov,position:camera.position.toArray(),aspect:camera.aspect,near:camera.near,far:camera.far},lighting:{hemisphere:{intensity:scene.children.find(o=>o.isHemisphereLight)?.intensity??null},directional:{intensity:sun.intensity,position:sun.position.toArray()},point:{intensity:blue.intensity,position:blue.position.toArray()}},renderer:{width:renderer.domElement.width,height:renderer.domElement.height,pixelRatio:renderer.getPixelRatio()},edgeDetection:edgeDetection.inspect()};
 probeText.value=JSON.stringify(report,null,2);return report;
}
probeButton.onclick=()=>{
 try{
  const snapshot=JSON.stringify(inspectWorld(),null,2);
  if(!snapshot)throw Error('Empty inspection');
  const legacyCopy=()=>{
   probeText.value=snapshot;probeText.style.setProperty('display','block','important');
   probeText.focus();probeText.select();probeText.setSelectionRange(0,snapshot.length);
   let ok=false;try{ok=document.execCommand('copy')===true}catch(e){console.warn('copy-error',e)}
   probeText.style.removeProperty('display');return ok;
  };
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(snapshot).catch(()=>{if(!legacyCopy())console.warn('Clipboard unavailable')});
  else if(!legacyCopy())console.warn('Clipboard unavailable');
 }catch(e){console.error('inspect-copy-error',e)}
};
detailsButton.onclick=()=>{
 const expanded=probePanel.classList.toggle('details');
 detailsButton.setAttribute('aria-expanded',String(expanded));
 detailsButton.textContent=expanded?'DETAILS ▴':'DETAILS ▾';
};
copyButton.onclick=()=>{
 const snapshot=probeText.value||JSON.stringify(inspectWorld(),null,2);
 if(navigator.clipboard?.writeText)navigator.clipboard.writeText(snapshot).catch(()=>{probeText.focus();probeText.select()});
 else{probeText.focus();probeText.select()}
};
globalThis.BaubleInspect=inspectWorld;

// First-class observational lens; Athanor owns scheduling, the tool owns rendering.
const edgeDetection=createEdgeDetection(T,renderer,camera);
edgeDetection.setMode('HYBRID');
let last=performance.now();
document.addEventListener('visibilitychange',()=>{last=performance.now();probeLast=last;probeFrames=0;probeFrameMs=0});
function frame(now){requestAnimationFrame(frame);
 const elapsed=now-last;last=now;
 if(elapsed>0&&elapsed<250){probeFrames++;probeFrameMs+=elapsed}
 if(now-probeLast>2500){
  if(probeFrames>=20&&probeFrameMs>0){displayFps=1000*probeFrames/probeFrameMs;fpsLabel.textContent=displayFps.toFixed(1)+' fps'}
  probeLast=now;probeFrames=0;probeFrameMs=0;
 }
for(const entry of mounts.values()){
 if(!entry.active||entry.error||typeof entry.source.update!=='function')continue;
 try{entry.source.update(elapsed/1000,now/1000)}catch(error){entry.error=String(error&&error.stack||error);console.error('World update failed: '+entry.id,error)}
}
camera.position.set(Math.sin(angle)*Math.cos(elev)*dist,Math.sin(elev)*dist+targetY,Math.cos(angle)*Math.cos(elev)*dist);camera.lookAt(0,targetY,0);edgeDetection.render(scene,camera)}
requestAnimationFrame(frame);
}catch(e){window.BaubleFatal(e);console.error(e)}
