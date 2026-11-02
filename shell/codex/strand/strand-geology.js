// Strand terrain remains neutral while material experiments run on an isolated specimen.
export function createStrandGeology(T, terrain) {
 return {inspect:()=>({name:'Strand terrain baseline',shader:'Arcana default',bump:false,greenTint:false})};
}
