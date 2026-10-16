// Shell's entry point. Worlds are authored in Codex; Athanor hosts them.
import './athanor/athanor.js';
import {createEntropy} from './codex/entropy/world.js';
const world=createEntropy();
globalThis.Athanor.mount('entropy',world);
world.attachView(globalThis.Athanor.view());
