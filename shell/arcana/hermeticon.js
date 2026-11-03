import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

/**
 * COMPOSABLE CONTRACT — Hermeticon vessel (not a world simulation).
 * Owns: glass, equatorial brass, rivets; radii outer=10.25, inner=10.07.
 * Returns TWO DETACHED groups: `group` (shell) and `content` (inhabitants).
 * Caller MUST mount both: `parent.add(vessel.group)` and
 * `vessel.group.add(vessel.content)`. The factory does not mount them.
 * World origin is the sphere center. Shell rotation rotates descendants;
 * rotate inhabitant content inversely if shell hardware needs its own axis.
 * Do not modify accepted glass/brass appearance to fix missing inhabitants.
 * Incident 2026-10-14: missing scene attachment made a nested eye invisible.
 */
const R=10.25, INNER_R=R-.18, DEFAULT_APERTURE=9.72;
// Explicit opt-out: object.userData.hermeticonAperture='exempt'.
// Visibility is evaluated on the renderable, not on a parent population group.
export function createHermeticon(){
 const group=new THREE.Group();group.name='Hermeticon';
 const glass=(radius,color,opacity,side)=>{
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(radius,72,48),
   new THREE.MeshPhysicalMaterial({color,metalness:0,roughness:.08,transparent:true,opacity,depthWrite:false,side}));
  mesh.name='Hermeticon glass';group.add(mesh);return mesh;
 };
 glass(R,0xa0dce2,.055,THREE.FrontSide);
 glass(INNER_R,0x9dcdd7,.035,THREE.BackSide);
 const brass=new THREE.MeshStandardMaterial({color:0xc99b50,metalness:.82,roughness:.28});
 const bright=new THREE.MeshStandardMaterial({color:0xf0d3a0,metalness:.85,roughness:.2});
 const hoop=(radius,tube,material,y)=>{
  const mesh=new THREE.Mesh(new THREE.TorusGeometry(radius,tube,10,120),material);
  mesh.rotation.x=Math.PI/2;mesh.position.y=y;group.add(mesh);
 };
 hoop(R,.095,brass,0);
 for(const y of [-.15,.15])hoop(R,.021,bright,y);
 for(let i=0;i<8;i++){const a=i*Math.PI/4;
  const rivet=new THREE.Mesh(new THREE.SphereGeometry(.12,12,8),bright);
  rivet.position.set(Math.cos(a)*R,0,Math.sin(a)*R);group.add(rivet);
 }
 const content=new THREE.Group();content.name='Hermeticon contents';
 let apertureRadius=DEFAULT_APERTURE,culled=0,examined=0,exempt=0;
 const center=new THREE.Vector3(),local=new THREE.Vector3(),scale=new THREE.Vector3(),rotation=new THREE.Quaternion();
 const managed=new Map();
 function updateAperture(){
  // Called centrally by Athanor before rendering, never by individual populations.
  content.updateWorldMatrix(true,true);
  examined=0;culled=0;exempt=0;
  const seen=new Set();
  content.traverse(o=>{
   if(!o.isMesh&&!o.isLine&&!o.isPoints)return;
   seen.add(o);
   if(!managed.has(o))managed.set(o,{authored:o.visible,applied:o.visible});
   const state=managed.get(o);
   if(o.visible!==state.applied)state.authored=o.visible;
   if(o.userData.hermeticonAperture==='exempt'){o.visible=state.authored;state.applied=o.visible;exempt++;return;}
   examined++;
   const g=o.geometry;
   if(!g){o.visible=state.authored;state.applied=o.visible;return;}
   if(!g.boundingSphere)g.computeBoundingSphere();
   if(!g.boundingSphere){o.visible=state.authored;state.applied=o.visible;return;}
   center.copy(g.boundingSphere.center).applyMatrix4(o.matrixWorld);
   group.worldToLocal(local.copy(center));
   o.matrixWorld.decompose(center,rotation,scale);
   const radius=g.boundingSphere.radius*Math.max(Math.abs(scale.x),Math.abs(scale.y),Math.abs(scale.z));
   const outside=local.length()-radius>apertureRadius;
   o.visible=state.authored&&!outside;state.applied=o.visible;
   if(outside)culled++;
  });
  for(const o of managed.keys())if(!seen.has(o))managed.delete(o);
 }
 return {group,content,aperture:{get radius(){return apertureRadius},setRadius(r){if(!(Number.isFinite(r)&&r>0&&r<=INNER_R))throw Error('Invalid Hermeticon aperture');apertureRadius=r},update:updateAperture,inspect:()=>({radius:apertureRadius,examined,culled,exempt,method:'per-renderable bounding sphere',partialClipping:false})},inspect(){return {name:'Hermeticon',vessel:{radius:R,innerRadius:INNER_R,glass:true,equatorialHardware:true},aperture:this.aperture.inspect(),children:this.content.children.length}}};
}

export const hermeticon=createHermeticon();
hermeticon.content.name='Hermeticon contents';
hermeticon.group.add(hermeticon.content);
