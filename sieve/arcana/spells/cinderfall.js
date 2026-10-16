// Adapted from the established Betwixt Crucible createMeteorSystem.
// Small glowing meteor, short-lived additive BB wake, impact callback.
// Genesis owns targeting; terrain remains immutable.
export function createCinderfall(T,{surface,targets=()=>[],offset=()=>({x:0,z:0}),parent=null,seed=741,radius=9.72,onImpact=()=>{}}={}){
 if(typeof surface!=='function')throw Error('Cinderfall requires surface(x,z)');
 const group=new T.Group();group.name='Cinderfall';parent?.add(group);
 const headGeometry=new T.SphereGeometry(.145,7,5);
 const headMaterial=new T.MeshBasicMaterial({color:0xff8a4c,transparent:true,opacity:.96});
 const emberGeometry=new T.SphereGeometry(1,5,4);
 const emberMaterial=new T.MeshBasicMaterial({color:0xff8a4c,transparent:true,opacity:.48,depthWrite:false,blending:T.AdditiveBlending});
 const heads=new T.Group();group.add(heads);
 const MAX=36,embers=new T.InstancedMesh(emberGeometry,emberMaterial,MAX);embers.count=0;embers.frustumCulled=false;group.add(embers);
 const dummy=new T.Object3D(),particles=[],impacts=[];let clock=0,serial=0;const active=[];
 function rand(){let x=(serial*2246822519+Math.floor(clock*1000)+seed)>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;serial=x>>>0;return serial/4294967296}
 function cast(){
  const choices=targets().filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.z)&&surface(p.x,p.z)!=null);
  if(!choices.length)return false;
  const target=choices[Math.floor(rand()*choices.length)],ground=surface(target.x,target.z);
  const start={x:target.x+(rand()-.5)*2.4,y:ground+10+rand()*3.2,z:target.z+(rand()-.5)*2.4};
  const head=new T.Mesh(headGeometry,headMaterial);heads.add(head);
  active.push({head,start,target:{x:target.x,y:Number.isFinite(target.altitude)?target.altitude:ground+.12,z:target.z},species:target.species||'creature',age:0,life:.35,lastEmit:0});
  return true;
 }
 function update(dt){
  dt=Math.min(.1,Math.max(0,dt));clock+=dt;const {x:ox=0,z:oz=0}=offset();
  for(let ai=active.length-1;ai>=0;ai--){
   const a=active[ai];a.age+=dt;
   // Betwixt's original quadratic ease-out: fast entry, no acceleration gimmick.
   const u=Math.min(1,a.age/a.life),e=1-(1-u)*(1-u);
   const x=a.start.x+(a.target.x-a.start.x)*e,y=a.start.y+(a.target.y-a.start.y)*e,z=a.start.z+(a.target.z-a.start.z)*e;
   a.head.position.set(x-ox,y,z-oz);
   if(a.age-a.lastEmit>=.034&&u<.94){
    const steps=Math.min(3,Math.floor((a.age-a.lastEmit)/.034));
    for(let k=0;k<steps;k++){a.lastEmit+=.034;particles.push({x:x+(rand()-.5)*.08,y:y+(rand()-.5)*.08,z:z+(rand()-.5)*.08,r:.025+.035*rand(),born:clock,life:.125+rand()*.095})}
   }
   if(u>=1){
    const point={...a.target};impacts.push({at:clock,point,species:a.species});if(impacts.length>12)impacts.shift();
    onImpact({point,magnitude:1,species:a.species,terrainChanged:false});
    heads.remove(a.head);active.splice(ai,1);
   }
  }
  let n=0;for(let i=particles.length-1;i>=0;i--){
   const p=particles[i],age=(clock-p.born)/p.life;
   if(age>=1){particles.splice(i,1);continue}
   if(n>=MAX)continue;
   dummy.position.set(p.x-ox,p.y,p.z-oz);dummy.scale.setScalar(p.r*(1-age*.55));dummy.updateMatrix();embers.setMatrixAt(n++,dummy.matrix);
  }
  embers.count=n;embers.instanceMatrix.needsUpdate=true;
 }
 return {group,cast,update,inspect:()=>({name:'Cinderfall — Betwixt Crucible meteor',falling:active.length,embers:embers.count,impacts:[...impacts],terrainChanged:false}),dispose(){group.removeFromParent();headGeometry.dispose();headMaterial.dispose();emberGeometry.dispose();emberMaterial.dispose()}};
}
