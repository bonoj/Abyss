// Shell's entry point. Worlds are authored in Codex; Athanor hosts them.
import './athanor/athanor.js';
import {createGenesis} from './codex/genesis/world.js';
const world=createGenesis();
globalThis.Athanor.mount('genesis',world);
world.attachView(globalThis.Athanor.view());
