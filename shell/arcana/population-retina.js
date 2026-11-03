// Shared population visibility aperture.
export function createPopulationRetina({radius=9.92}={}){
 const participants=new Map();
 const inside=p=>Math.hypot(p.x,p.y,p.z)<=radius;
 return {inside,register:(id,participant)=>participants.set(id,participant),update(){for(const participant of participants.values())participant.visible(inside(participant.position()));},inspect:()=>({name:'3D retina population aperture',radius,registered:participants.size})};
}
