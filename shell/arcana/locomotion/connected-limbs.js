// Planar connected N-limb experimental mechanism. Feet have finite mass and never vanish.
// Compliant bilateral hip-to-foot link; unilateral terrain reaction at each foot.
// This is a deliberately simplified spring-linked body, not a rigid articulated joint solver.
export function createConnectedLimbs({surface,limbs=[
 {id:'left',hipX:-.12,hipY:-.24,footX:-.12},
 {id:'right',hipX:.12,hipY:-.24,footX:.12}
],length=.84,stiffness=220,damping=16,footMass=.12,footRadius=.055,groundStiffness=1400,groundDamping=35,friction=.86}={}){
 if(typeof surface!=='function')throw Error('surface required');
 const nodes=limbs.map((d,i)=>({...d,id:d.id??String(i),foot:null,force:[0,0],groundForce:[0,0],length:0,contact:false,peakError:0}));
 let steps=0,contacts=0,peakError=0;
 const hip=(s,n)=>{const c=Math.cos(s.pitch),q=Math.sin(s.pitch),rx=n.hipX*c+n.hipY*q,ry=-n.hipX*q+n.hipY*c;return {x:s.x+rx,y:s.y+ry,rx,ry,vx:s.vx+s.omega*ry,vy:s.vy-s.omega*rx}};
 function sample(s,{dt=1/120}={}){
  let fx=0,fy=0,torque=0;contacts=0;
  for(const n of nodes){
   const h=hip(s,n);
   if(!n.foot){const x=s.x+n.footX,y=surface(x,s.z);n.foot={x,y:Number.isFinite(y)?y+footRadius:h.y-length,vx:0,vy:0};}
   const f=n.foot,dx=h.x-f.x,dy=h.y-f.y,L=Math.max(1e-8,Math.hypot(dx,dy)),nx=dx/L,ny=dy/L;
   const relative=(h.vx-f.vx)*nx+(h.vy-f.vy)*ny;
   const tension=stiffness*(L-length)+damping*relative;
   // Bilateral connection: stretched legs pull, compressed legs push. No reach cutoff.
   const lx=-tension*nx,ly=-tension*ny;
   fx+=lx;fy+=ly;torque+=h.ry*lx-h.rx*ly;
   const gx=-lx,gy=-ly;
   f.vx+=gx/footMass*dt;f.vy+=(gy/footMass-9.8)*dt;
   f.x+=f.vx*dt;f.y+=f.vy*dt;
   const ground=surface(f.x,s.z);let reaction=0,tangent=0;
   if(Number.isFinite(ground)){
    const penetration=ground+footRadius-f.y;
    if(penetration>0){
     reaction=Math.max(0,groundStiffness*penetration-groundDamping*f.vy);
     f.vy+=reaction/footMass*dt;
     // Coulomb-limited lateral impulse; foot is free to slip.
     const maxDelta=friction*reaction/footMass*dt;
     const delta=Math.min(Math.abs(f.vx),maxDelta)*Math.sign(f.vx);
     f.vx-=delta;tangent=-delta*footMass/dt;
     // Conservative penetration correction for numerical stability.
     f.y=Math.max(f.y,ground+footRadius);
    }
   }
   n.contact=reaction>0;n.force=[lx,ly];n.groundForce=[tangent,reaction];n.length=L;
   n.peakError=Math.max(n.peakError,Math.abs(L-length));peakError=Math.max(peakError,n.peakError);
   if(n.contact)contacts++;
  }
  steps++;
  return {x:fx,y:fy,z:0,torque};
 }
 const inspect=()=>({name:'connected limbs',mode:'N-limb bilateral compliant connection; dynamic feet and unilateral ground contact',limbCount:nodes.length,steps,contacts,footMass,length,stiffness,damping,peakLengthError:peakError,legs:nodes.map(n=>({id:n.id,connected:true,groundContact:n.contact,foot:n.foot?{...n.foot}:null,hipForce:n.force,groundForce:n.groundForce,length:n.length,peakLengthError:n.peakError}))});
 return {sample,hasFootSupport:()=>contacts>0,constrain:()=>{},getFeet:()=>nodes.map(n=>n.foot?{x:n.foot.x,y:n.foot.y,z:0}:null),inspect};
}
