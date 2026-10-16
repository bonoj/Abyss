// Shell bootstrap. Import the selected Codex world by the deployment's exact SHA.
// The versioned URL prevents a fresh build.json from disguising a stale world module.
import './athanor/athanor.js';
const build=new URL(import.meta.url).searchParams.get('build');
if(!/^[a-f0-9]{40}$/.test(build||''))throw Error('Shell entry missing verified deployment SHA');
const {createEntropy}=await import('./codex/entropy/world.js?build='+build);
const world=createEntropy();
globalThis.Athanor.mount('entropy',world);
world.attachView(globalThis.Athanor.view());
