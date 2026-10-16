// Shell source entry. Publisher bundles this entire local dependency graph into
// a single immutable, commit-addressed artifact. Never deploy this source entry directly.
import './athanor/athanor.js';
import {createEntropy} from './codex/entropy/world.js';
import {createEuropa} from './codex/europa/world.js';
const europa=new URLSearchParams(location.search).get('world')==='europa';
const world=europa?createEuropa():createEntropy();
globalThis.Athanor.mount(europa?'europa':'entropy',world);
world.attachView(globalThis.Athanor.view());
