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
 const edge=createEquatorialTreatment({terrain,parent:world.content});world.cycleEdge=edge.cycle;world.edgeMode=edge.getMode;
 const surface=createTerrainSurfaceQuery(terrain),offset=()=>({x:0,z:0});
 const landscape=createStrandGeology(T,terrain);
 const bricks=createBrickRain(T,{parent:world.content,terrain});
 const debris=createBeadDebris(T,{terrain,offset,innerRadius:world.inspect().vessel.innerRadius,parent:world.content});
 const impacts=createImpactDispatcher({debris,creatures:[],plants:[],terrain,surface});
 const meteor=createCinderfall(T,{surface,offset,targets:()=>[],parent:world.content,radius:terrain.getAperture(),seed:741,onImpact:event=>{
  const hit=event.hit||{kind:'terrain'};
  bricks.receiveBlast({...event,hit});
  const groundMagnitude=event.magnitude*(hit.kind==='body'?({stone:.65,wood:.35,ice:.48}[hit.material]??.5):1);
  impacts.dispatch({...event,magnitude:groundMagnitude});
 }});
 const raycaster=new T.Raycaster();let view=null;
 const pickables=()=>{const meshes=bricks.pickables();terrain.group.traverse(o=>{if(o.isMesh)meshes.push(o)});return meshes};
 function targetAt(x,z){
  // Meteor descends vertically; nearest collider along its path wins.
  const origin=new T.Vector3(x,16,z);raycaster.set(origin,new T.Vector3(0,-1,0));
  const hits=raycaster.intersectObjects(pickables(),false);
  const first=hits.find(h=>h.point.y>=-3.6);if(!first)return null;
  const body=bricks.bodyForMesh(first.object);
  return {x:first.point.x,z:first.point.z,altitude:first.point.y,hit:body?{kind:'body',bodyId:body.id,material:body.material}:{kind:'terrain'}};
 }
 world.targetMeteor=(clientX,clientY)=>{
  if(!view)return false;
  const rect=view.renderer.domElement.getBoundingClientRect();
  const pointer=new T.Vector2((clientX-rect.left)/rect.width*2-1,-((clientY-rect.top)/rect.height*2-1));
  raycaster.setFromCamera(pointer,view.camera);
  const hit=raycaster.intersectObjects([...bricks.pickables(),...terrainMeshes],false)[0];
  if(!hit)return false;
  const target=targetAt(hit.point.x,hit.point.z);return target?meteor.cast(target):false;
 };
 world.castMeteor=()=>meteor.cast();world.eye=()=>bricks.eye();world.materialSurvey=createMaterialSurvey({populations:[],debris});
 world.update=dt=>{meteor.update(dt);debris.update(dt);bricks.update(dt)};world.attachView=v=>{view=v};
 const inspectVessel=world.inspect.bind(world);
 world.inspect=()=>({name:'Strand',shell:inspectVessel(),systems:[terrain.inspect(),landscape.inspect(),bricks.inspect(),edge.inspect(),meteor.inspect(),debris.inspect()],material:world.materialSurvey(),eye:world.eye(),meteorImpact:impacts.inspect()});return world;
}
