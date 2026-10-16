// Entropy is an authored composition, not a reusable Arcana definition.
import {createHermeticon} from '../../arcana/hermeticon.js';
import {createTerrain} from '../../arcana/terrain.js?v=stable-20bd541b-restore';
import {createTerrainSurfaceQuery} from '../../arcana/terrain-surface-query.js';
import {createNodeMaker} from '../../arcana/node-maker.js?v=1';
import {createWanderer} from '../../arcana/wanderer.js';
import {createMistsReeds} from '../../arcana/populations/mists-reeds.js';
import {createBBGarden} from '../../arcana/populations/bb-garden.js';
import {createSecondGarden} from '../../arcana/populations/second-garden.js';
import {createFirstBestiary} from '../../arcana/creatures/first-bestiary.js';
import {createVelvetDrifters} from '../../arcana/creatures/velvet-drifters.js';
import {createThreadwyrms} from '../../arcana/creatures/threadwyrms.js';
import {createGlasswings} from '../../arcana/creatures/glasswings.js';
import {createBellwraiths} from '../../arcana/creatures/bellwraiths.js';
import {createLanternHermits} from '../../arcana/creatures/lantern-hermits.js';
import {createBeadDebris} from '../../arcana/physics/bead-debris.js';
import {createImpactDispatcher} from '../../arcana/physics/impact-dispatcher.js';
import {createMaterialSurvey} from '../../arcana/observation/material-survey.js';
import {createTerrainNavigation} from '../../arcana/interaction/terrain-navigation.js';
import {createCinderfall} from '../../arcana/spells/cinderfall.js';
import {createEquatorialTreatment} from '../../arcana/equatorial-treatment.js';
import * as T from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

export function createEntropy(){
 const world=createHermeticon();
 world.group.name='Entropy';
 world.content.name='Entropy contents';
 world.group.add(world.content);
 // Abioentropy: an empty nested Hermeticon halfway down the lower hemisphere.
 const abioentropy=createHermeticon();
 abioentropy.group.name='Abioentropy';
 abioentropy.content.name='Abioentropy contents';
 // L0 "The Cradle": deterministic bounded stationkeeping about the lower center.
 const cradle={name:'L0 — The Cradle',center:[0,-6.23,0],time:0};
 abioentropy.group.position.set(...cradle.center);
 abioentropy.group.scale.setScalar(0.12);
 const updateCradle=dt=>{
  cradle.time+=Math.max(0,dt);
  const t=cradle.time;
  abioentropy.group.position.set(
   cradle.center[0]+0.65*Math.sin(t*0.19)+0.25*Math.sin(t*0.071+1.1),
   cradle.center[1]+0.72*Math.sin(t*0.27+0.4)+0.28*Math.sin(t*0.113),
   cradle.center[2]+0.56*Math.sin(t*0.16+2.2)+0.22*Math.sin(t*0.063)
  );
 };
 abioentropy.group.add(abioentropy.content);
 world.content.add(abioentropy.group);
 world.abioentropy=abioentropy;
 const terrain=createTerrain();
 world.content.add(terrain.group);
 world.observationTargets=()=>({terrain:terrain.group});
 const equatorial=createEquatorialTreatment({terrain,parent:world.content});
 world.cycleEdge=equatorial.cycle;
 world.edgeMode=equatorial.getMode;

 // Deliberately empty: future GPU boundary experiment supplies node positions.
 // This maker owns only instances, colors, and honest instrumentation.
 const nodeMaker=createNodeMaker(T,world.content);
 world.setWitnessNodes=nodes=>nodeMaker.set(nodes);
 const wanderer=createWanderer({terrain});
 world.content.add(wanderer.group);
 // Entropy begins without flora or fauna. Their Arcana implementations remain untouched.
 const terrainSurface=createTerrainSurfaceQuery(terrain);
 const botanicalOffset=()=>{const [x,z]=wanderer.inspect().offset;return {x,z}};
 const cradleCollision={position:abioentropy.group.position,scale:.12,innerRadius:10.07};
 const debris=createBeadDebris(T,{terrain,offset:botanicalOffset,innerRadius:world.inspect().vessel.innerRadius,parent:world.content,abioentropy:cradleCollision,wanderer:{inspect:()=>wanderer.inspect(),innerRadius:10.07*.06}});
 // Eye is independent of the established populations and terrain.
 let eye=null,eyeError=null,eyeCamera=null;
 const creatureSystems=[];
 const observeEyeWorld=()=>{
  const o=botanicalOffset(),targets=[];
  const w=wanderer.inspect();
  targets.push({id:'wanderer',position:[w.x-o.x,w.y+.5,w.z-o.z],salience:1});
  for(const system of creatureSystems){
   const snapshot=system.inspect();
   for(const [index,c] of (snapshot.creatures||[]).entries()){
    if(!Number.isFinite(c.x)||!Number.isFinite(c.z))continue;
    const y=Number.isFinite(c.altitude)?c.altitude:Number.isFinite(c.y)?c.y:terrainSurface(c.x,c.z);
    if(y==null)continue;
    targets.push({id:(snapshot.name||'creature')+':'+index,position:[c.x-o.x,y,c.z-o.z],salience:2.5});
   }
  }
  return targets;
 };
 // The retired single eye remains preserved in Arcana, not instantiated.
 const impactDispatcher=createImpactDispatcher({debris,creatures:creatureSystems,plants:[],terrain,surface:terrainSurface});
 const cinderfall=createCinderfall(T,{surface:terrainSurface,offset:botanicalOffset,
  targets:()=>creatureSystems.flatMap(s=>s.inspect().creatures||[]),
  parent:world.content,radius:terrain.getAperture(),seed:741,
  onImpact:impactDispatcher.dispatch});
 world.castMeteor=()=>cinderfall.cast();
 const navigation=createTerrainNavigation({terrain,actor:wanderer});
 world.attachView=view=>{navigation.attachView(view);eyeCamera=view?.camera??null};
 const tapRaycaster=new T.Raycaster(),tapPoint=new T.Vector2(),tapSphere=new T.Sphere(),tapCenter=new T.Vector3();
 const terrainTapRaycaster=new T.Raycaster();
 world.tap=(x,y)=>{
  if(eyeCamera?.isCamera){
   const canvas=document.querySelector('#stage canvas'),rect=canvas?.getBoundingClientRect();
   if(rect?.width&&rect?.height){
    tapPoint.set((x-rect.left)/rect.width*2-1,-(y-rect.top)/rect.height*2+1);
    tapRaycaster.setFromCamera(tapPoint,eyeCamera);
    abioentropy.group.getWorldPosition(tapCenter);
    tapSphere.set(tapCenter,10.25*abioentropy.group.getWorldScale(new T.Vector3()).x);
    const sphereDistance=tapRaycaster.ray.intersectSphere(tapSphere,new T.Vector3());
    if(sphereDistance){
     // The visible terrain is opaque to taps: the Cradle may only receive
     // a tap if its front shell is nearer than the first terrain surface.
     const terrainHit=terrainTapRaycaster.ray.copy(tapRaycaster.ray);
     const occluder=terrain.firstVisibleRayHit(terrainTapRaycaster);
     const shellDistance=tapRaycaster.ray.origin.distanceTo(sphereDistance);
     if(occluder&&occluder.distance<=shellDistance+1e-4)return navigation.tap(x,y);
     debris.directRegionToward({maxY:0,target:{x:abioentropy.group.position.x,y:abioentropy.group.position.y,z:abioentropy.group.position.z},speed:22});
     return true;
    }
   }
  }
  return navigation.tap(x,y);
 };

 world.update=dt=>{updateCradle(dt);wanderer.update(dt);cinderfall.update(dt);debris.update(dt);if(eye&&!eyeError){try{eye.update(dt,eyeCamera)}catch(error){eyeError=String(error);console.error('Eye update disabled; Entropy continues',error)}}};
 const inspectShell=world.inspect.bind(world);
 const materialSurvey=createMaterialSurvey({populations:[],debris});
 world.materialSurvey=materialSurvey;
 world.inspect=()=>({name:'Entropy',shell:inspectShell(),systems:[{name:'abioentropy',stationkeeping:{name:cradle.name,center:cradle.center,position:abioentropy.group.position.toArray()},scale:0.12,...abioentropy.inspect()},{name:'eye',enabled:false,instantiated:false,error:null},{name:'Betwixt observer swarm',enabled:false,instantiated:false},{name:'terrain',...terrain.inspect()},{name:'wanderer',...wanderer.inspect()},cinderfall.inspect(),debris.inspect()],material:materialSurvey(),meteorImpact:impactDispatcher.inspect(),edgeGeometry:equatorial.geometry,edgeTreatment:equatorial.inspect(),nodes:nodeMaker.inspect(),tapOwnership:navigation.inspect()});
 return world;
}
