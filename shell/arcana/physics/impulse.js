export function applyRadialImpulse(body,origin,{radius=3.2,impulse=18}={}){
 const dx=body.x-origin.x,dy=body.y-origin.y,dz=body.z-origin.z,d=Math.hypot(dx,dy,dz);
 if(!(radius>0&&d<radius))return 0;
 const dv=impulse*(1-d/radius)**2,k=d>1e-6?dv/d:0;
 body.vx+=dx*k;body.vy+=d>1e-6?dy*k:dv;body.vz+=dz*k;
 return dv;
}
