// Extracted from athanor/world.js rainStep and terrainMicroContact.
// Physical coordinates are Hermeticon-relative; caller owns geological offsets.
// No renderer, scene, or population dependencies.
export const WANDERER_PHYSICS=Object.freeze({
 gravity:9.8, terrainRestitution:.38, terrainTangentDamping:.82,
 microRestitution:.24, microFriction:.86,
 vesselRestitution:.38, settleSpeed:.42, terrainSweepStep:.065,
 terrainContactPush:.035, vesselMargin:.012
});
export function reflectContact(body,normal,restitution=WANDERER_PHYSICS.terrainRestitution,tangentDamping=1){
 const {x:nx,y:ny,z:nz}=normal;
 const incoming=body.vx*nx+body.vy*ny+body.vz*nz;
 if(incoming>=0)return false;
 body.vx-=(1+restitution)*incoming*nx;
 body.vy-=(1+restitution)*incoming*ny;
 body.vz-=(1+restitution)*incoming*nz;
 const vn=body.vx*nx+body.vy*ny+body.vz*nz;
 body.vx=(body.vx-vn*nx)*tangentDamping+vn*nx;
 body.vy=(body.vy-vn*ny)*tangentDamping+vn*ny;
 body.vz=(body.vz-vn*nz)*tangentDamping+vn*nz;
 return true;
}
export function signedFieldNormal(sample,x,y,z,h=.09){
 const nx=sample(x-h,y,z)-sample(x+h,y,z);
 const ny=sample(x,y-h,z)-sample(x,y+h,z);
 const nz=sample(x,y,z-h)-sample(x,y,z+h);
 const len=Math.hypot(nx,ny,nz);
 return len>.00001?{x:nx/len,y:ny/len,z:nz/len}:{x:0,y:1,z:0};
}
// Lower hemisphere is a bowl; the upper hemisphere is an open aperture.
// The caller must use the actual Hermeticon inner radius, never a copied value.
export function catchVesselUnderside(body,{innerRadius,beadRadius=0,margin=WANDERER_PHYSICS.vesselMargin}){
 const rr=Math.hypot(body.x,body.y,body.z),limit=innerRadius-beadRadius-margin;
 if(!(body.y<0&&rr>limit&&rr<limit+.45))return {caught:false,bounced:false};
 const nx=-body.x/rr,ny=-body.y/rr,nz=-body.z/rr;
 body.x=body.x/rr*limit;body.y=body.y/rr*limit;body.z=body.z/rr*limit;
 const bounced=reflectContact(body,{x:nx,y:ny,z:nz},WANDERER_PHYSICS.vesselRestitution);
 const settled=ny>.95&&Math.hypot(body.vx,body.vy,body.vz)<WANDERER_PHYSICS.settleSpeed;
 return {caught:true,bounced,settled,normal:{x:nx,y:ny,z:nz}};
}
