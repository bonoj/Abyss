// Contact-first planar N-limb equilibrium fixture. No gait or world-space propulsion.
// Each massless axial strut transmits only compressive force along its hip-to-foot axis.
export function createContactLimbs({surface,limbs=[
 {id:'left',hipX:-.12,hipY:-.24,footX:-.12},
 {id:'right',hipX:.12,hipY:-.24,footX:.12}
],restLength=.84,stiffness=180,damping=20,maxForce=80,maxLength=1.04}={}){
 if(typeof surface!=='function')throw Error('terrain surface required');
 const nodes=limbs.map((def,i)=>({...def,id:def.id??String(i),anchor:null}));
 let last=[],wrench={force:[0,0,0],torque:0},steps=0,supportedSteps=0,unsupportedSteps=0;
 function hip(body,limb){const c=Math.cos(body.pitch||0),s=Math.sin(body.pitch||0);const rx=limb.hipX*c-limb.hipY*s,ry=limb.hipX*s+limb.hipY*c;return {x:body.x+rx,y:body.y+ry,z:body.z,rx,ry};}
 function sample(body){
  const total={x:0,y:0,z:0,torque:0};
  last=nodes.map(limb=>{
   if(!limb.anchor){const x=body.x+limb.footX,z=body.z,y=surface(x,z);if(Number.isFinite(y))limb.anchor={x,y,z};}
   const h=hip(body,limb),a=limb.anchor;
   const record={id:limb.id,hip:[h.x,h.y,h.z],anchor:a?{...a}:null,state:'detached',connected:false,force:[0,0,0],torque:0,normalReaction:0,frictionForce:0};
   if(!a)return record;
   const dx=h.x-a.x,dy=h.y-a.y,dz=h.z-a.z,length=Math.hypot(dx,dy,dz);
   record.length=length;record.maxLength=maxLength;
   if(length<1e-8||length>maxLength){record.state='out-of-reach';return record;}
   const nx=dx/length,ny=dy/length,nz=dz/length;
   const vx=body.vx+(body.omega||0)*h.ry,vy=body.vy-(body.omega||0)*h.rx;
   const rate=nx*vx+ny*vy+nz*body.vz;
   const compression=Math.max(0,restLength-length);
   const magnitude=Math.min(maxForce,Math.max(0,stiffness*compression-damping*rate));
   // A unilateral ground contact cannot pull downward or transmit arbitrary lateral thrust.
   // The axial leg's foot reaction must lie inside the ground friction cone.
   const mu=.86;
   const force=(ny>0&&Math.hypot(nx,nz)<=mu*ny)?magnitude:0;
   const fx=force*nx,fy=force*ny,fz=force*nz,torque=h.ry*fx-h.rx*fy;
   total.x+=fx;total.y+=fy;total.z+=fz;total.torque+=torque;
   Object.assign(record,{state:force>0?'supporting':'touching',connected:true,force:[fx,fy,fz],torque,normalReaction:fy,frictionForce:Math.hypot(fx,fz),lengthRate:rate,compression});
   return record;
  });
  steps++;
  if(last.some(l=>l.normalReaction>0))supportedSteps++;else unsupportedSteps++;
  wrench={force:[total.x,total.y,total.z],torque:total.torque,gravityResidual:[total.x,total.y-9.8,total.torque],supporting:last.filter(l=>l.normalReaction>0).length};
  return total;
 }
 function inspect(){return {name:'contact limbs',mode:'N-limb axial compression; standing fixture, no gait',limbCount:nodes.length,steps,supportedSteps,unsupportedSteps,restLength,stiffness,damping,maxForce,maxLength,legs:last,wrench,feet:nodes.map(n=>({id:n.id,anchor:n.anchor}))};}
 return {sample,hasFootSupport:()=>last.some(l=>l.normalReaction>0),constrain:()=>{},getFeet:()=>nodes.map(n=>n.anchor),inspect};
}
