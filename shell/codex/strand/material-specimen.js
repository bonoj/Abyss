// Strand prototype: a coherent rigid rock backed by a conserved BB inventory.
// No particle-level bond solver yet. Terrain support is sampled every frame.
export function createMaterialSpecimen(T,{parent,surface,terrain}) {
 const group=new T.Group();group.name='Strand coherent rock / BB inventory';parent.add(group);
 const rock=new T.Group();group.add(rock);
 const geometry=new T.IcosahedronGeometry(1,1);
 const material=new T.MeshStandardMaterial({color:0x85817a,roughness:1,metalness:0,flatShading:true});
 const mesh=new T.Mesh(geometry,material);
 mesh.scale.set(1.1,.82,.94);rock.add(mesh);
 const beads=[];const count=96;const golden=2.399963229728653;
 for(let i=0;i<count;i++){
  const y=1-2*(i+.5)/count, radius=Math.sqrt(1-y*y),a=i*golden;
  beads.push({x:radius*Math.cos(a)*.91,y:y*.68,z:radius*Math.sin(a)*.77,mass:1/count});
 }
 const state={velocity:0,settled:false,unsupported:false,fallDistance:0};
 const x=1.6,z=.7;const initial=surface(x,z);
 rock.position.set(x,(initial??0)+2.6,z);
 // Ellipsoidal footprint approximates the rigid body's lowest support point.
 const supportRadius=.82;
 function update(dt){
  const step=Math.min(Math.max(dt||0,0),.05);
  const sample=surface(rock.position.x,rock.position.z);
  const floor=sample===null?-Infinity:sample+supportRadius;
  state.unsupported=sample===null||rock.position.y>floor+.04;
  if(rock.position.y>floor+.001){
   state.velocity-=9.8*step;
   rock.position.y+=state.velocity*step;
   if(rock.position.y<=floor){rock.position.y=floor;state.velocity=0;state.settled=true;}
   else state.settled=false;
  }else if(rock.position.y<floor){
   rock.position.y=floor;state.velocity=0;state.settled=true;
  }
  state.fallDistance=Math.max(0,(initial??0)+2.6-rock.position.y);
 }
 return {group,update,inspect:()=>({name:'Strand coherent rock',representation:'rigid visual hull + latent BB inventory',bbCount:beads.length,bbMass:beads.reduce((sum,b)=>sum+b.mass,0),settled:state.settled,unsupported:state.unsupported,fallDistance:state.fallDistance,terrainSupport:'top signed-field crossing',limitations:'No bond solver, no torque/rolling, no cave contact or fragmentation'})};
}
