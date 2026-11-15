import * as T from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {createHermeticon} from '../../arcana/hermeticon.js';
import {createTerrain} from '../../arcana/terrain.js';
import {createTerrainSurfaceQuery} from '../../arcana/terrain-surface-query.js';
import {createBeadDebris} from '../../arcana/physics/bead-debris.js';
import {createImpactDispatcher} from '../../arcana/physics/impact-dispatcher.js';
import {createCinderfall} from '../../arcana/spells/cinderfall.js';
import {createMaterialSurvey} from '../../arcana/observation/material-survey.js';
import {createStrandGeology} from './strand-geology.js';
import {createBrickRain} from './brick-rain.js';
import {createEquatorialTreatment} from '../../arcana/equatorial-treatment.js';
// Strand shader experiment: keep visual treatments local to this world.
export function createStrand(){
 const world=createHermeticon();world.group.name='Strand';world.content.name='Strand contents';world.group.add(world.content);
 const terrain=createTerrain({topology:'atlas'});world.content.add(terrain.group);world.observationTargets=()=>({terrain:terrain.group});
 const edge=createEquatorialTreatment({terrain,parent:world.content});
 world.cycleEdge=edge.cycle;world.edgeMode=edge.getMode;
 const surface=createTerrainSurfaceQuery(terrain),offset=()=>({x:0,z:0});
 const landscape=createStrandGeology(T,terrain);
 const bricks=createBrickRain(T,{parent:world.content,terrain,visibleEntity:world.visibleEntity});
 const debris=createBeadDebris(T,{terrain,offset,innerRadius:world.inspect().vessel.innerRadius,parent:world.content,visibleEntity:world.visibleEntity});
 const impacts=createImpactDispatcher({debris,creatures:[],plants:[],terrain,surface});
 const meteor=createCinderfall(T,{surface,offset,targets:()=>[],parent:world.content,radius:terrain.getAperture(),seed:741,onImpact:event=>{
  const hit=event.hit||{kind:'terrain'};
  bricks.receiveBlast({...event,hit});
  const groundMagnitude=event.magnitude*(hit.kind==='body'?({stone:.65,wood:.35,ice:.48}[hit.material]??.5):1);
  impacts.dispatch({...event,magnitude:groundMagnitude});
 }});
 const raycaster=new T.Raycaster();let view=null;
 const pickables=()=>{const meshes=bricks.pickables().filter(o=>o.visible);terrain.group.traverse(o=>{if(o.isMesh&&o.visible)meshes.push(o)});return meshes};
 function targetAt(x,z){
  // Meteor descends vertically; nearest collider along its path wins.
  const origin=new T.Vector3(x,16,z);raycaster.set(origin,new T.Vector3(0,-1,0));
  const hits=raycaster.intersectObjects(pickables(),false);
  const first=hits.find(h=>h.point.y>=-3.6&&world.visibleEntity(h.point.x,h.point.y,h.point.z));if(!first)return null;
  const body=bricks.bodyForMesh(first.object);
  return {x:first.point.x,z:first.point.z,altitude:first.point.y,hit:body?{kind:'body',bodyId:body.id,material:body.material}:{kind:'terrain'}};
 }
 // Eye surface lens: an actual GPU render of the active stone material on its
 // existing brick geometry. Captured only when the human presses Eye.
 world.captureSurface=()=>{
  if(!view)return {error:'view-unavailable'};
  const specimen=bricks.stoneSurfaceMesh();
  if(!specimen)return {error:'no-stone-spawned'};
  const size=192,renderer=view.renderer;
  const target=new T.WebGLRenderTarget(size,size,{depthBuffer:true});
  const scene=new T.Scene();scene.background=new T.Color(0x17202a);
  const mesh=new T.Mesh(specimen.geometry,specimen.material);scene.add(mesh);
  mesh.rotation.set(.26,.55,.12);
  scene.add(new T.HemisphereLight(0xd9e5ef,0x33373d,2));
  const light=new T.DirectionalLight(0xffedcf,2.2);light.position.set(-2,4,5);scene.add(light);
  const camera=new T.PerspectiveCamera(35,1,.05,10);
  camera.position.set(.55,.37,.9);camera.lookAt(0,0,0);
  const previous=renderer.getRenderTarget(),clear=renderer.getClearColor(new T.Color()),alpha=renderer.getClearAlpha();
  const pixels=new Uint8Array(size*size*4);
  try{
   renderer.setRenderTarget(target);renderer.clear();renderer.render(scene,camera);
   renderer.readRenderTargetPixels(target,0,0,size,size,pixels);
  }finally{
   renderer.setRenderTarget(previous);renderer.setClearColor(clear,alpha);target.dispose();
  }
  const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;
  const ctx=canvas.getContext('2d'),image=ctx.createImageData(size,size);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const src=((size-1-y)*size+x)*4,dst=(y*size+x)*4;
   image.data[dst]=pixels[src];image.data[dst+1]=pixels[src+1];image.data[dst+2]=pixels[src+2];image.data[dst+3]=255;
  }
  ctx.putImageData(image,0,0);
  const grid=[],luminances=[];
  for(let gy=0;gy<16;gy++){
   let row='';
   for(let gx=0;gx<16;gx++){
    const x=Math.floor((gx+.5)*size/16),y=Math.floor((gy+.5)*size/16),i=(y*size+x)*4;
    const r=image.data[i],g=image.data[i+1],b=image.data[i+2];
    row+=Math.round((.2126*r+.7152*g+.0722*b)/255*15).toString(16);
    if(r+g+b>100)luminances.push((r+g+b)/3);
   }
   grid.push(row);
  }
  const mean=luminances.reduce((a,b)=>a+b,0)/Math.max(1,luminances.length);
  const variance=luminances.reduce((a,b)=>a+(b-mean)**2,0)/Math.max(1,luminances.length);
  return {schema:'strand-surface-eye/v1',kind:'gpu-rendered-stone-specimen',
   material:specimen.material.name,source:'same mesh geometry and active material, isolated diagnostic lighting',
   resolution:[size,size],grid16:grid,meanBrightness:+mean.toFixed(2),
   brightnessStdDev:+Math.sqrt(variance).toFixed(2),
   shader:{version:'strand-stone-06',rock:'baked basalt',features:'four 128px tileable PBR albedo/normal/roughness variants',relief:'mipmapped tangent-space normal map'},
   limitations:['Specimen lighting differs from live scene','Grid is a lossy brightness digest, not a screenshot','Image is shown in Eye details; copy/share the image to enable visual inspection'],
   preview:canvas.toDataURL('image/png')};
 };
 world.targetMeteor=(clientX,clientY)=>{
  if(!view)return false;
  const rect=view.renderer.domElement.getBoundingClientRect();
  const pointer=new T.Vector2((clientX-rect.left)/rect.width*2-1,-((clientY-rect.top)/rect.height*2-1));
  raycaster.setFromCamera(pointer,view.camera);
  const hit=raycaster.intersectObjects(pickables(),false).find(h=>world.visibleEntity(h.point.x,h.point.y,h.point.z));
  if(!hit)return false;
  const target=targetAt(hit.point.x,hit.point.z);return target?meteor.cast(target):false;
 };
 world.castMeteor=()=>meteor.cast();world.eye=()=>bricks.eye();world.materialSurvey=createMaterialSurvey({populations:[],debris});
 world.update=dt=>{meteor.update(dt);debris.update(dt);bricks.update(dt)};world.attachView=v=>{view=v};
 const inspectVessel=world.inspect.bind(world);
 world.inspect=()=>({name:'Strand',shell:inspectVessel(),systems:[terrain.inspect(),landscape.inspect(),bricks.inspect(),edge.inspect(),meteor.inspect(),debris.inspect()],material:world.materialSurvey(),eye:world.eye(),meteorImpact:impacts.inspect()});return world;
}
