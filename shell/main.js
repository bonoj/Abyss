// Shell source entry. Publisher bundles this entire local dependency graph into
// a single immutable, commit-addressed artifact. Never deploy this source entry directly.
import './athanor/athanor.js';
import {createEntropy} from './codex/entropy/world.js';
import {createEuropa} from './codex/europa/world.js';
const world=createEntropy();
globalThis.Athanor.mount('entropy',world);
world.attachView(globalThis.Athanor.view());
