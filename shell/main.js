// Shell source entry. Publisher bundles this entire local dependency graph into
// a single immutable, commit-addressed artifact. Never deploy this source entry directly.
import './athanor/athanor.js';
import {createEntropy} from './codex/entropy/world.js';
import {createEuropa} from './codex/europa/world.js';
const europa=new URLSearchParams(location.search).get('world')==='europa';
const world=europa?createEuropa():createEntropy();
globalThis.Athanor.mount(europa?'europa':'entropy',world);
world.attachView(globalThis.Athanor.view());

// Explicit, opt-in diagnostic operation; no automatic excavation on boot.
if(europa)globalThis.europaExtractJSON=(options,recoveryFraction)=>world.extractTestCore(options,recoveryFraction);

if(europa){
 globalThis.europaSectionJSON=options=>world.europaSection(options);
 globalThis.europaMapJSON=options=>world.europaMap(options);
 globalThis.europaProfileJSON=(x,z)=>world.europaProfile(x,z);
 globalThis.europaSiteJSON=(x,z)=>world.europaSite(x,z);
 globalThis.europaCompareJSON=sites=>world.compareSites(sites);
 globalThis.europaInterrogateJSON=()=>world.interrogateEuropa();
}

if(europa){
 const button=document.createElement('button');
 button.type='button';button.textContent='▤';button.title='Europa synthetic cross-section';button.setAttribute('aria-label','Toggle Europa cross-section');
 document.querySelector('#buttons')?.prepend(button);
 const panel=document.createElement('section');
 panel.id='europaSectionPanel';panel.hidden=true;
 Object.assign(panel.style,{position:'fixed',top:'12%',left:'4%',width:'92%',maxHeight:'70vh',overflow:'auto',zIndex:'80',background:'#091725',color:'#e8f2f6',border:'1px solid #668699',borderRadius:'12px',padding:'12px',boxSizing:'border-box',boxShadow:'0 8px 30px #000a'});
 const heading=document.createElement('div');
 heading.textContent='EUROPA · SYNTHETIC STRATIGRAPHY — NOT OBSERVED';
 heading.style.cssText='font:600 12px system-ui;margin-bottom:8px';
 const canvas=document.createElement('canvas');canvas.style.cssText='width:100%;height:auto;image-rendering:pixelated';
 const legend=document.createElement('div');
 legend.textContent='Blue: radiolytic skin · Teal: reworked ice · Violet: inherited ice · Gold: transported lens · Black: terrain void (signed field)';
 legend.style.cssText='font:11px/1.5 system-ui;margin-top:8px';
 const mode=document.createElement('button');mode.textContent='MAP / SECTION';let mapMode=false,siteX=0,siteZ=0;
 const site=document.createElement('div');site.style.cssText='font:12px system-ui;margin:8px 0';
 const compare=document.createElement('button');compare.textContent='COMPARE SITES';
 const comparison=document.createElement('div');comparison.style.cssText='font:11px/1.5 system-ui;white-space:pre-wrap;margin:8px 0';
 const drill=document.createElement('button');drill.textContent='EXTRACT TWO CORES';
 drill.onclick=()=>{try{const report=world.interrogateEuropa();drill.disabled=true;comparison.textContent=report.trials.map(t=>t.site.name+': '+t.removedNodes+' nodes · lens '+(t.lensDetected?'DETECTED':'absent')+' · balance '+t.ledgerBalanced+' · terrain '+t.inventoryMatchesTerrain).join('\n')+'\nDiscriminated: '+report.discriminated+' · synthetic only';render()}catch(error){comparison.textContent='Trial failed: '+error.message}};
 compare.onclick=()=>{const results=world.compareSites([{x:-3.1,z:2.2},{x:5,z:-3}]);comparison.textContent=results.map(r=>'('+r.x+', '+r.z+') · lens '+(r.transportedLens?'YES':'NO')+' · solute proxy '+r.meanSoluteProxy.toFixed(3)).join('\n')+'\nSynthetic hypotheses only; no cores extracted.'};
 mode.onclick=()=>{mapMode=!mapMode;render()};
 const close=document.createElement('button');close.textContent='CLOSE';close.onclick=()=>{panel.hidden=true};
 panel.append(heading,canvas,site,legend,mode,compare,drill,comparison,close);document.body.append(panel);
 const colors={'radiolytic-skin':'#9ce6fc','reworked-ice':'#48a9b3','inherited-ice':'#7167b6','transported-lens':'#e3b35e'};
 const render=()=>{
  const section=mapMode?world.europaMap({columns:81,rows:42,depth:.15}):world.europaSection({x:siteX,columns:81,rows:42});
  site.textContent='SITE x='+siteX.toFixed(1)+' z='+siteZ.toFixed(1)+' · '+(mapMode?'tap map to choose a site':'section at selected x');
  canvas.width=section.columns*4;canvas.height=section.rows*4;
  const ctx=canvas.getContext('2d');
  section.cells.forEach((row,j)=>row.forEach((cell,i)=>{
   ctx.fillStyle=section.occupancy?.[j]?.[i]===false?'#091725':colors[cell.unit];
   ctx.fillRect(i*4,j*4,4,4);
  }));
  if(mapMode){const i=Math.round((siteX-section.xStart)/(section.xEnd-section.xStart)*(section.columns-1)),j=Math.round((siteZ-section.zStart)/(section.zEnd-section.zStart)*(section.rows-1));ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.strokeRect(i*4-3,j*4-3,10,10)}
 };
 canvas.addEventListener('click',event=>{if(!mapMode)return;const rect=canvas.getBoundingClientRect(),u=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width)),v=Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height));siteX=-8+16*u;siteZ=-8+16*v;render()});
 button.onclick=()=>{panel.hidden=!panel.hidden;if(!panel.hidden)render()};
}
