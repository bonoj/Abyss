// EUROPA-01: isolated experimental scene, not mounted by Shell yet.
// Illustrative ice terrain; no calibrated Europan material composition.
import * as T from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {createHermeticon} from '../../arcana/hermeticon.js';
import {createTerrain} from '../../arcana/terrain.js';

export function createEuropa(){
 const world=createHermeticon();
 world.group.name='Europa experiment';
 world.content.name='Europa contents';
 world.group.add(world.content);
 const terrain=createTerrain({topology:'atlas'});
 world.content.add(terrain.group);
 const originalInspect=world.inspect.bind(world);
 world.inspect=()=>({name:'Europa',shell:originalInspect(),
  experiment:{schema:'europa-world/v0',status:'visual substrate only',
   topology:'atlas',terrain:terrain.inspect(),
   materialCalibration:false,sampleCount:0,excavationEnabled:false,
   caveat:'Existing terrain material IDs are not Europan chemical species'}});
 world.update=()=>{};
 world.attachView=()=>{};
 return world;
}
