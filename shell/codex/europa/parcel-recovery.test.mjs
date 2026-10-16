import assert from 'node:assert/strict';
import {allocateRecoveredParcels,recoveredIntervals} from './parcel-recovery.js';
const parcels=[
 {position:[0,2,0],depth:.1,materialId:1,unit:'skin'},
 {position:[0,1,0],depth:1.1,materialId:2,unit:'deep'},
 {position:[1,1,0],depth:1.2,materialId:1,unit:'deep'},
 {position:[2,0,0],depth:2.1,materialId:2,unit:'deep'},
 {position:[3,0,0],depth:2.2,materialId:1,unit:'deep'}
];
const a=allocateRecoveredParcels(parcels,{'1':2,'2':1});
assert.deepEqual(a.map(p=>p.disposition),['recovered','recovered','recovered','dispersed','dispersed']);
assert.equal(a.filter(p=>p.disposition==='recovered'&&p.materialId===1).length,2);
assert.equal(a.filter(p=>p.disposition==='recovered'&&p.materialId===2).length,1);
assert.deepEqual(a,allocateRecoveredParcels(parcels,{'1':2,'2':1}));
assert.deepEqual(parcels.map(p=>p.disposition),[undefined,undefined,undefined,undefined,undefined]);
const b=recoveredIntervals(a,{step:.5});
assert.deepEqual(b.ordered.map(p=>p.depth),[.1,1.1,1.2]);
assert.deepEqual(b.intervals.map(i=>i.count),[1,2]);
assert.equal(b.intervals[1].units.deep,2);
assert.deepEqual(allocateRecoveredParcels(parcels,{'1':0,'2':0}).map(p=>p.disposition),Array(5).fill('dispersed'));
assert.throws(()=>allocateRecoveredParcels(parcels,{'1':4,'2':1}));
assert.throws(()=>allocateRecoveredParcels(parcels,{'1':2}));
assert.throws(()=>recoveredIntervals(a,{step:0}));
console.log('PASS Europa exact parcel recovery and depth intervals');
