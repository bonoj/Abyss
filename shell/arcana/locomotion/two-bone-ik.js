// Reusable, allocation-free planar two-bone inverse kinematics.
// Inputs are points in a common coordinate frame; the pole selects bend direction.
// No terrain, gravity, gait, species, or rendering dependencies.
export function solveTwoBone(root,target,{upper,lower,pole={x:0,y:0,z:1},epsilon=1e-6}={}){
 if(![upper,lower].every(n=>Number.isFinite(n)&&n>0))throw Error('IK requires positive segment lengths');
 const sub=(a,b)=>({x:a.x-b.x,y:a.y-b.y,z:a.z-b.z});
 const dot=(a,b)=>a.x*b.x+a.y*b.y+a.z*b.z;
 const cross=(a,b)=>({x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x});
 const scale=(a,s)=>({x:a.x*s,y:a.y*s,z:a.z*s});
 const add=(a,b)=>({x:a.x+b.x,y:a.y+b.y,z:a.z+b.z});
 const length=a=>Math.hypot(a.x,a.y,a.z);
 const unit=(a,fallback)=>{const l=length(a);return l>epsilon?scale(a,1/l):fallback};
 const delta=sub(target,root),distance=length(delta),axis=unit(delta,{x:0,y:-1,z:0});
 const minimum=Math.abs(upper-lower)+epsilon,maximum=upper+lower-epsilon;
 const reach=Math.max(minimum,Math.min(maximum,distance));
 const end=add(root,scale(axis,reach));
 let bend=sub(pole,scale(axis,dot(pole,axis)));
 if(length(bend)<=epsilon){const alternate=Math.abs(axis.y)<.9?{x:0,y:1,z:0}:{x:1,y:0,z:0};bend=cross(axis,alternate)}
 bend=unit(bend,{x:0,y:0,z:1});
 const along=(upper*upper-lower*lower+reach*reach)/(2*reach);
 const height=Math.sqrt(Math.max(0,upper*upper-along*along));
 const joint=add(add(root,scale(axis,along)),scale(bend,height));
 return {root:{...root},joint,end,target:{...target},reached:distance<=maximum&&distance>=minimum,error:Math.abs(distance-reach),distance,reach};
}
