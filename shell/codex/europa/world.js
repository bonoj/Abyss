// EUROPA-01: opt-in experimental scene via ?world=europa.
// Illustrative ice terrain; no calibrated Europan material composition.
import {createHermeticon} from '../../arcana/hermeticon.js';
import {createTerrain} from '../../arcana/terrain.js';
import {createMaterialLedger} from './material-ledger.js';
import {createStratigraphy} from './stratigraphy.js';

export function createEuropa(){
 const world=createHermeticon();
 world.group.name='Europa experiment';
 world.content.name='Europa contents';
 world.group.add(world.content);
 const terrain=createTerrain({topology:'atlas'});
 world.content.add(terrain.group);
 const ledger=createMaterialLedger(terrain.inventoryNodes());
 const stratigraphy=createStratigraphy();
 world.europaSection=options=>{
  const section=stratigraphy.crossSection(options);
  section.occupancy=section.cells.map((row,j)=>row.map((_,i)=>{
   const z=section.zStart+(section.zEnd-section.zStart)*i/(section.columns-1);
   const y=section.yTop-(section.yTop-section.yBottom)*j/(section.rows-1);
   return terrain.sample(section.x,y,z)>0;
  }));
  return section;
 };
 world.europaMap=options=>stratigraphy.surfaceMap(options);
 world.europaProfile=(x=0,z=0)=>Array.from({length:25},(_,i)=>stratigraphy.sample(x,1.5-i*.125,z));
 const extractions=[];
 world.extractTestCore=(options={x:0,z:0,radius:.8,yTop:3.6,yBottom:-3.6},recoveryFraction=1)=>{
  if(!Number.isFinite(recoveryFraction)||recoveryFraction<0||recoveryFraction>1)throw Error('invalid recovery fraction');
  const provenance={};
  const parcels=[];
  const result=terrain.extractNodes(options,node=>{
   const history=stratigraphy.sample(node.x,node.y,node.z);
   const key=history.unit;
   provenance[key]=(provenance[key]||0)+1;
   parcels.push({position:[node.x,node.y,node.z],materialId:node.materialId,unit:key,composition:history.composition,provenance:history.provenance});
  });
  const recovered={},dispersed={};
  for(const [k,n] of Object.entries(result.removed)){
   recovered[k]=Math.floor(n*recoveryFraction);
   dispersed[k]=n-recovered[k];
  }
  ledger.transfer('inPlace','recovered',recovered);
  ledger.transfer('inPlace','dispersed',dispersed);
  const report={...result,recovered,dispersed,provenance,parcels,
   provenanceAccountingMatches:parcels.length===result.count,
   balanced:ledger.inspect().balanced};
  extractions.push(report);return report;
 };
 world.materialSurvey=()=>ledger.inspect();
 const originalInspect=world.inspect.bind(world);
 world.inspect=()=>({name:'Europa',shell:originalInspect(),
  experiment:{schema:'europa-world/v0',status:'authoritative lattice-node extraction, no physical calibration',
   topology:'atlas',terrain:terrain.inspect(),
   materialCalibration:false,sampleCount:extractions.length,excavationEnabled:true,
   materialAccounting:ledger.inspect(),lastExtraction:extractions.at(-1)||null,
   stratigraphy:{schema:'synthetic-stratigraphy/v0',source:'independent illustrative field',coupledToExcavation:true,profile:world.europaProfile()},
   caveat:'Existing terrain material IDs are not Europan chemical species'}});
 world.update=()=>{};
 world.attachView=()=>{};
 return world;
}
