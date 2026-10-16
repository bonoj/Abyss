// Fixed-step, deterministic gravity/contact experiment; independent of rendering.
export function runDropTrial({surface,x=0,z=0,seed=741,gravity=9.8,mass=1,radius=.18,height=1.4,dt=1/120,duration=3,sampleEvery=4}={}){
 if(typeof surface!=='function')throw Error('terrain surface required');
 const terrainY=surface(x,z);
 if(!Number.isFinite(terrainY))return {schema:'entropy-locomotion/v1',scenario:'drop-and-settle',seed,status:'no-surface',samples:[],events:[]};
 const floor=terrainY+radius,initialY=floor+height;
 let y=initialY,vy=0,contact=false,settledAt=null,maxCorrection=0,impactSpeed=null;
 const samples=[],events=[],steps=Math.round(duration/dt);
 const n=v=>+v.toFixed(7);
 for(let i=0;i<=steps;i++){
  const t=i*dt;
  if(i%sampleEvery===0||i===steps)samples.push({t:n(t),body:{position:[n(x),n(y),n(z)],velocity:[0,n(vy),0]},contacts:contact?[{normal:[0,1,0],penetration:0}]:[],energy:{kinetic:n(mass*vy*vy/2),potential:n(mass*gravity*(y-floor))}});
  if(i===steps)break;
  vy-=gravity*dt;y+=vy*dt;
  if(y<=floor){
   maxCorrection=Math.max(maxCorrection,floor-y);
   if(!contact){impactSpeed=Math.abs(vy);events.push({t:n((i+1)*dt),type:'impact',speed:n(impactSpeed)})}
   y=floor;vy=0;contact=true;
   if(settledAt===null){settledAt=(i+1)*dt;events.push({t:n(settledAt),type:'settled'})}
  }else contact=false;
 }
 return {schema:'entropy-locomotion/v1',scenario:'drop-and-settle',seed,status:'completed',parameters:{dt,duration,sampleEvery,mass,radius,gravity,height,terrainY,initialPosition:[x,initialY,z],integrator:'semi-implicit Euler, inelastic unilateral floor'},summary:{steps,sampleCount:samples.length,impactSpeed:impactSpeed===null?null:n(impactSpeed),settlingTime:settledAt===null?null:n(settledAt),maxPreCorrectionPenetration:n(maxCorrection),finalPosition:[n(x),n(y),n(z)],finalVelocity:[0,n(vy),0],resting:contact},events,samples};
}
