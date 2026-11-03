// Strand accretion prototype: independent state, no extra meshes or lighting bakes.
// Two slow scalar reservoirs driven by environmental proxies, not a full fluid/ecology simulation.
export function createAccretion(){
 const state={moss:0,soot:0,moisture:.8,combustion:.9,elapsed:0};
 function update(dt){
  const t=Math.min(Math.max(dt||0,0),.05);state.elapsed+=t;
  // Shaded, damp substrate permits growth; a localized source deposits soot.
  state.moss=Math.min(1,state.moss+t*.075*state.moisture*(1-state.moss));
  state.soot=Math.min(1,state.soot+t*.11*state.combustion*(1-state.soot));
 }
 return{state,update,inspect:()=>({...state,model:'proxy moisture and combustion reservoirs; no actual fire or hydrology connected'})};
}
