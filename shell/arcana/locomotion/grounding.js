// Gravity defines down; terrain supplies contact, not arbitrary height relocation.
export const GRAVITY = 9.8;
export function stepGrounded(p,dt,{surface,speed=0,radius=9.72,homeRadius=Infinity,stepHeight=.16,footprint=.18,turnRate=2,gravity=GRAVITY}){
 dt=Math.max(0,Math.min(.1,dt));
 if(!Number.isFinite(p.vy))p.vy=0;
 if(p.grounded===undefined)p.grounded=true;
 const floor=surface(p.x,p.z);
 if(p.grounded&&floor!=null&&floor>p.y&&floor-p.y<=stepHeight){p.y=floor;p.vy=0}
 else if(floor==null||floor<p.y-.025||floor>p.y+stepHeight)p.grounded=false;
 let blocked=false;
 if(speed>0&&p.grounded){
  const nx=p.x+Math.cos(p.heading)*speed*dt,nz=p.z+Math.sin(p.heading)*speed*dt,ny=surface(nx,nz);
  const left=surface(nx+Math.sin(p.heading)*footprint,nz-Math.cos(p.heading)*footprint),right=surface(nx-Math.sin(p.heading)*footprint,nz+Math.cos(p.heading)*footprint);
  if(ny!=null&&left!=null&&right!=null&&ny-p.y<=stepHeight&&Math.abs(left-ny)<=stepHeight*1.3&&Math.abs(right-ny)<=stepHeight*1.3&&Math.hypot(nx,nz)<radius&&Math.hypot(nx-p.homeX,nz-p.homeZ)<homeRadius){p.x=nx;p.z=nz}else blocked=true;
 }
 if(blocked)p.heading+=turnRate*dt;
 const ground=surface(p.x,p.z);
 if(ground!=null&&p.y<=ground+.012&&p.vy<=0&&ground-p.y<=stepHeight){p.y=ground;p.vy=0;p.grounded=true}
 else p.grounded=false;
 if(!p.grounded){const previousY=p.y;p.vy=Math.max(-18,p.vy-gravity*dt);p.y+=p.vy*dt;const landing=surface(p.x,p.z);if(landing!=null&&previousY>=landing-.012&&p.y<=landing){p.y=landing;p.vy=0;p.grounded=true}}
 return {grounded:p.grounded,blocked,vy:p.vy};
}
