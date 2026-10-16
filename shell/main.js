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
 legend.textContent='Blue: radiolytic skin · Teal: reworked ice · Violet: inherited ice · Black: outside occupied terrain (illustrative)';
 legend.style.cssText='font:11px/1.5 system-ui;margin-top:8px';
 const mode=document.createElement('button');mode.textContent='MAP / SECTION';let mapMode=false;
 mode.onclick=()=>{mapMode=!mapMode;render()};
 const close=document.createElement('button');close.textContent='CLOSE';close.onclick=()=>{panel.hidden=true};
 panel.append(heading,canvas,legend,mode,close);document.body.append(panel);
 const colors={'radiolytic-skin':'#9ce6fc','reworked-ice':'#48a9b3','inherited-ice':'#7167b6'};
 const render=()=>{
  const section=mapMode?world.europaMap({columns:81,rows:42,depth:.15}):world.europaSection({columns:81,rows:42});
  canvas.width=section.columns*4;canvas.height=section.rows*4;
  const ctx=canvas.getContext('2d');
  section.cells.forEach((row,j)=>row.forEach((cell,i)=>{
   // This mask uses the independent synthetic top boundary, not the terrain field.
   const y=mapMode?0:section.yTop-(section.yTop-section.yBottom)*j/(section.rows-1);
   const z=mapMode?0:section.zStart+(section.zEnd-section.zStart)*i/(section.columns-1);
   const top=1.15+0.13*Math.sin(section.x*.47+741*.001)*Math.cos(z*.31);
   ctx.fillStyle=section.occupancy?.[j]?.[i]===false?'#091725':colors[cell.unit];
   ctx.fillRect(i*4,j*4,4,4);
  }));
 };
 button.onclick=()=>{panel.hidden=!panel.hidden;if(!panel.hidden)render()};
}
