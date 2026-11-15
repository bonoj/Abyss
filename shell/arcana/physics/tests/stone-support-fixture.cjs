// Deterministic, dependency-free support-point geometry smoke test.
// Run: node shell/arcana/physics/tests/stone-support-fixture.cjs
const assert=require('node:assert/strict');
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
const add=(a,b)=>a.map((x,i)=>x+b[i]);
const scale=(a,s)=>a.map(x=>x*s);
function support(center,axes,half,direction){
 return axes.reduce((p,axis,i)=>{
  const d=dot(axis,direction);
  return Math.abs(d)<1e-8?p:add(p,scale(axis,Math.sign(d)*half[i]));
 },center);
}
function contact(a,b,n){
 return scale(add(support(a.p,a.axes,a.h,n),support(b.p,b.axes,b.h,scale(n,-1))),.5);
}
const axes=[[1,0,0],[0,1,0],[0,0,1]],h=[.1975,.1075,.1275];
const a={p:[0,0,0],axes,h};
for(const [offset,normal] of [[[.36,0,0],[1,0,0]],[[0,.19,0],[0,1,0]],[[0,0,.24],[0,0,1]]]){
 const point=contact(a,{p:offset,axes,h},normal);
 const expected=offset.map(v=>v/2);
 for(let i=0;i<3;i++)assert(Math.abs(point[i]-expected[i])<1e-8);
}
console.log('PASS: centered X/Y/Z face contacts');
