import * as T from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {createHermeticon} from '../../arcana/hermeticon.js';
import {createTerrain} from '../../arcana/terrain.js';
import {createTerrainSurfaceQuery} from '../../arcana/terrain-surface-query.js';
import {createBeadDebris} from '../../arcana/physics/bead-debris.js';
import {createImpactDispatcher} from '../../arcana/physics/impact-dispatcher.js';
import {createCinderfall} from '../../arcana/spells/cinderfall.js';
import {createMaterialSurvey} from '../../arcana/observation/material-survey.js';
import {createStrandGeology} from './strand-geology.js';
import {createMaterialSpecimen} from './material-specimen.js';
import {createEquatorialTreatment} from '../../arcana/equatorial-treatment.js';
// Strand shader experiment: keep visual treatments local to this world.
export function createStrand(){
 const world=createHermeticon();world.group.name='Strand';world.content.name='Strand contents';world.group.add(world.content);
 const terrain=createTerrain({topology:'atlas'});world.content.add(terrain.group);world.observationTargets=()=>({terrain:terrain.group});
 const edge=createEquatorialTreatment({terrain,parent:world.content});world.cycleEdge=edge.cycle;world.edgeMode=edge.getMode;
 const surface=createTerrainSurfaceQuery(terrain),offset=()=>({x:0,z:0});
 const landscape=createStrandGeology(T,terrain);
 const specimen=createMaterialSpecimen(T,{parent:world.content,surface,terrain});
 const debris=createBeadDebris(T,{terrain,offset,innerRadius:world.inspect().vessel.innerRadius,parent:world.content});
 const impacts=createImpactDispatcher({debris,creatures:[],plants:[],terrain,surface});
 const meteor=createCinderfall(T,{surface,offset,targets:()=>[],parent:world.content,radius:terrain.getAperture(),seed:741,onImpact:impacts.dispatch});
 world.castMeteor=()=>meteor.cast();world.materialSurvey=createMaterialSurvey({populations:[],debris});
 world.update=dt=>{meteor.update(dt);debris.update(dt);specimen.update(dt)};world.attachView=()=>{};
 const inspectVessel=world.inspect.bind(world);
 world.inspect=()=>({name:'Strand',shell:inspectVessel(),systems:[terrain.inspect(),landscape.inspect(),specimen.inspect(),edge.inspect(),meteor.inspect(),debris.inspect()],material:world.materialSurvey(),meteorImpact:impacts.inspect()});return world;
}
