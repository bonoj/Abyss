// Sieve's independent entrance uses the shared Athanor and its cloned world.
import '../athanor/athanor.js';
import {createGenesis} from '../codex/sieve/world.js';
const sieve=createGenesis();
globalThis.Athanor.mount('sieve',sieve);
sieve.attachView(globalThis.Athanor.view());
