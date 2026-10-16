// Experiment 002: horizontal impulse, friction, slope support and ballistic loss.
export function runMomentumTrial({surface,x=0,z=0,seed=741,gravity=9.8,radius=.18,mass=1,velocity=2.2,friction=.65,dt=1/120,duration=4,sampleEvery=8}={}){
 if(typeof surface!=='function')throw Error('surface required');
 const h0=surface(x,z);
 if(!Number.isFinite(h0))return {schema:'entropy-locomotion/v1',scenario:'momentum-and-support',seed,status:'no-surface',samples:[],events:[]};
 const n=v=>+v.toFixed(7),steps=Math.round(duration/dt);
 let px=x,py=h0+radius,pz=z,vx=velocity,vy=0,contact=true,maxCorrection=0,airborneTime=0,contactChanges=0;
 const events=[{t:0,type:'impulse',velocity:[velocity,0,0]}],samples=[];
 for(let i=0;i<=steps;i++){
  const t=i*dt;
  if(i%sampleEvery===0||i===steps)samples.push({t:n(t),body:{position:[n(px),n(py),n(pz)],velocity:[n(vx),n(vy),0]},contacts:contact?[{normal:[0,1,0]}]:[],energy:{kinetic:n(mass*(vx*vx+vy*vy)/2),potential:n(mass*gravity*(py-(h0+radius)))}});
  if(i===steps)break;
  // Coulomb kinetic friction on horizontal support; no scripted horizontal steering.
  if(contact){const decel=friction*gravity*dt;vx=Math.sign(vx)*Math.max(0,Math.abs(vx)-decel)}
  vy-=gravity*dt;px+=vx*dt;py+=vy*dt;
  const ground=surface(px,pz),supported=Number.isFinite(ground);
  if(supported&&py<=ground+radius){
   maxCorrection=Math.max(maxCorrection,ground+radius-py);
   py=ground+radius;vy=0;
   if(!contact){contactChanges++;events.push({t:n((i+1)*dt),type:'contact-gained',x:n(px)})}
   contact=true;
  }else{
   airborneTime+=dt;
   if(contact){contactChanges++;events.push({t:n((i+1)*dt),type:'support-lost',x:n(px)})}
   contact=false;
  }
 }
 return {schema:'entropy-locomotion/v1',scenario:'momentum-and-support',seed,status:'completed',parameters:{x,z,dt,duration,sampleEvery,gravity,mass,radius,initialHorizontalVelocity:velocity,friction,integrator:'semi-implicit Euler; horizontal Coulomb friction; heightfield unilateral contact'},summary:{steps,sampleCount:samples.length,maxPreCorrectionPenetration:n(maxCorrection),airborneTime:n(airborneTime),contactChanges,finalPosition:[n(px),n(py),n(pz)],finalVelocity:[n(vx),n(vy),0],resting:contact&&vx===0&&vy===0},events,samples};
}
